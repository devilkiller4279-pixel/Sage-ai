import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import { getUserFromRequest } from '../../../lib/auth';
import { query } from '../../../lib/db';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = getUserFromRequest(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId, message, image } = req.body;

    if (!sessionId || (!message && !image)) {
        return res.status(400).json({ error: 'Session ID and message/image are required' });
    }

    try {
        let finalMessage = message || '';

        // processing image with OpenRouter if present
        if (image) {
            try {
                const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'allenai/molmo-2-8b:free',
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: 'Describe this image in detail.' },
                                    { type: 'image_url', image_url: { url: image } }
                                ]
                            }
                        ]
                    })
                });

                if (openRouterRes.ok) {
                    const data = await openRouterRes.json();
                    const description = data.choices?.[0]?.message?.content;
                    if (description) {
                        finalMessage = `${finalMessage ? finalMessage + '\n\n' : ''}[System: User uploaded an image. Image Description: ${description}]`;
                    } else {
                        finalMessage = finalMessage || '[Image uploaded]';
                    }
                } else {
                    finalMessage = finalMessage || '[Image uploaded]';
                }
            } catch (imageError) {
                console.error('Failed to analyze image:', imageError);
                finalMessage = finalMessage || '[Image uploaded]';
                // Continue without description if fails
            }
        }

        const sessionResult = await query(
            'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
            [sessionId, user.id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Save original message to DB (without big description to keep it clean for user, or with it? 
        // Usually better to save what user typed + indicator)
        // actually for history context we need the description. 
        // But for display we might want just "Image Uploaded".
        // Let's save the augmented message for now so context persists.
        // OR better: save the user input, but use augmented message for AI generation.
        // The issue is future turns won't have the context if we don't save it.
        // So we will save the augmented message to DB.

        // Wait, the user sees this message. If I replace it with description, it looks weird.
        // Best approach: Save what user typed. When constructing history for Groq, inject the description.
        // BUT, if we reload the chat, we lose the description if we don't save it.
        // So we MUST save the description if we want memory.
        // Let's append it to the content stored.
        
        console.log("Inserting:", sessionId, 'user', finalMessage);

        await query(
            'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
            [sessionId, 'user', finalMessage]
        );

        const messagesResult = await query(
            'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
            [sessionId]
        );

        const chatHistory = messagesResult.rows.map((msg: any) => ({
            role: msg.role,
            content: msg.content
        }));

        const startTime = Date.now();
        const completion = await groq.chat.completions.create({
            messages: chatHistory,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2048,
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        await query(
            'INSERT INTO messages (session_id, role, content, response_time) VALUES ($1, $2, $3, $4)',
            [sessionId, 'assistant', assistantMessage, responseTime]
        );

        await query(
            'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
            [sessionId]
        );

        // Generate a concise title using AI after the second user message
        try {
            // Count user messages (we just added one, so check if this is the second)
            const userMessagesCount = messagesResult.rows.filter((msg: any) => msg.role === 'user').length;

            // After inserting the current message, we'll have 2 user messages
            if (userMessagesCount === 2) { // This condition means the current message is the second user message
                // Get the first two user messages
                const userMessages = await query(
                    'SELECT content FROM messages WHERE session_id = $1 AND role = $2 ORDER BY created_at ASC LIMIT 2',
                    [sessionId, 'user']
                );

                const firstMessage = userMessages.rows[0]?.content || '';
                const secondMessage = message || '[Image uploaded]'; // The current message is the second user message

                const titleCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a title generator. Generate a very short, concise title (maximum 4-5 words) that summarizes the following conversation. Only respond with the title, nothing else.'
                        },
                        {
                            role: 'user',
                            content: `First message: ${firstMessage}\n\nSecond message: ${secondMessage}`
                        }
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 20,
                });

                const generatedTitle = titleCompletion.choices[0]?.message?.content?.trim() || firstMessage.split(' ').slice(0, 5).join(' ');

                await query(
                    'UPDATE chat_sessions SET title = $1 WHERE id = $2',
                    [generatedTitle, sessionId]
                );
            }
        } catch (titleError) {
            console.error('Title generation error:', titleError);
            // Fallback - do nothing, the chat will keep "New Chat" as title
        }

        res.status(200).json({
            success: true,
            message: assistantMessage,
            response_time: responseTime
        });
    } catch (error) {
        console.error('Message error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
}
