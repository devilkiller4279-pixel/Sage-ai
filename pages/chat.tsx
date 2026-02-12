import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../lib/useAuth';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import FloatingLines from '../components/FloatingLines';
import styles from '../styles/Chat.module.css';

interface Session {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

interface Message {
    id?: number;
    role: string;
    content: string;
    created_at: string;
    response_time?: number;
}

export default function Chat() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        } else if (user) {
            loadSessions();
        }
    }, [user, loading, router]);

    const loadSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/sessions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const createNewChat = async (): Promise<Session | null> => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'New Chat' })
            });

            if (res.ok) {
                const data = await res.json();
                setSessions([data.session, ...sessions]);
                setCurrentSession(data.session);
                setMessages([]);
                return data.session;
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
        return null;
    };

    const loadSession = async (sessionId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/chat/session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentSession(data.session);
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    };

    const deleteSession = async (sessionId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/chat/session/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== sessionId));
                if (currentSession?.id === sessionId) {
                    setCurrentSession(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const sendMessage = async (content: string, image?: string) => {
        let activeSessionId = currentSession?.id;

        if (!activeSessionId) {
            const newSession = await createNewChat();
            if (newSession) {
                activeSessionId = newSession.id;
            } else {
                return;
            }
        }

        const userMessage: Message = {
            role: 'user',
            content: image ? `${content}\n\n[Image Uploaded]` : content,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: activeSessionId,
                    message: content,
                    image // Send image base64
                })
            });

            if (res.ok) {
                const data = await res.json();
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.message,
                    created_at: new Date().toISOString(),
                    response_time: data.response_time
                };
                setMessages(prev => [...prev, assistantMessage]);
                loadSessions();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_CHATBOT_NAME || 'CodeXGPT'}</title>
                <meta name="description" content="AI Chatbot powered by Groq" />
                <link rel="icon" href={process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/icons/1301573144817045524/5d9c89de6514ef1459463a8f9950d050.png?size=1024'} />
            </Head>

            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <FloatingLines
                    lineCount={9}
                    lineDistance={0.5}
                    bendRadius={10}
                    bendStrength={2}
                    linesGradient={['#07e421', '#09d478', '#35f600']}
                    animationSpeed={0.5}
                />
            </div>

            <div className={styles.chatContainer}>
                <Sidebar
                    sessions={sessions}
                    currentSession={currentSession}
                    onNewChat={createNewChat}
                    onSelectSession={loadSession}
                    onDeleteSession={deleteSession}
                    onLogout={logout}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    user={user}
                />

                <ChatArea
                    messages={messages}
                    onSendMessage={sendMessage}
                    currentSession={currentSession}
                    sidebarOpen={sidebarOpen}
                />
            </div>
        </>
    );
}
