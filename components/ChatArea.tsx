import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiCpu, FiZap, FiCode, FiTrendingUp } from 'react-icons/fi';
import Message from './Message';
import MessageInput from './MessageInput';
import styles from '../styles/Chat.module.css';

interface MessageType {
    id?: number;
    role: string;
    content: string;
    created_at: string;
}

interface Session {
    id: number;
    title: string;
}

interface ChatAreaProps {
    messages: MessageType[];
    onSendMessage: (content: string) => void;
    currentSession: Session | null;
    sidebarOpen: boolean;
}

export default function ChatArea({ messages, onSendMessage, currentSession, sidebarOpen }: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className={`${styles.chatArea} ${sidebarOpen ? '' : styles.chatAreaExpanded}`}>
            <div className={styles.messagesContainer}>
                {messages.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Image
                                src={process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/icons/1301573144817045524/5d9c89de6514ef1459463a8f9950d050.png?size=1024'}
                                alt="Logo"
                                width={80}
                                height={80}
                                className={styles.emptyLogo}
                            />
                        </div>
                        <h2>How can I help you today?</h2>
                        <p>Start a conversation by typing a message below</p>

                        <div className={styles.suggestionsGrid}>
                            <button
                                className={styles.suggestionCard}
                                onClick={() => onSendMessage('Explain quantum computing in simple terms')}
                            >
                                <FiCpu className={styles.suggestionIcon} size={24} />
                                <span>Explain quantum computing</span>
                            </button>
                            <button
                                className={styles.suggestionCard}
                                onClick={() => onSendMessage('Write a Python function to sort a list')}
                            >
                                <FiCode className={styles.suggestionIcon} size={24} />
                                <span>Help me write code</span>
                            </button>
                            <button
                                className={styles.suggestionCard}
                                onClick={() => onSendMessage('What are the latest AI trends?')}
                            >
                                <FiTrendingUp className={styles.suggestionIcon} size={24} />
                                <span>Latest AI trends</span>
                            </button>
                            <button
                                className={styles.suggestionCard}
                                onClick={() => onSendMessage('Creative ideas for a birthday party')}
                            >
                                <FiZap className={styles.suggestionIcon} size={24} />
                                <span>Get creative ideas</span>
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}

                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={onSendMessage} disabled={!currentSession && messages.length > 0} />
        </div>
    );
}
