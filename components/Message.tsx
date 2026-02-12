import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiVolume2, FiStopCircle, FiZap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from '../styles/Chat.module.css';

interface MessageType {
    role: string;
    content: string;
    created_at: string;
    response_time?: number;
}

interface MessageProps {
    message: MessageType;
}

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeBlockHeader}>
                <span className={styles.codeLanguage}>{language || 'code'}</span>
                <button onClick={handleCopy} className={styles.copyButton}>
                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy code'}</span>
                </button>
            </div>
            <SyntaxHighlighter
                language={language || 'text'}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    fontSize: '14px',
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export default function Message({ message }: MessageProps) {
    const isUser = message.role === 'user';
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Stop speaking when component unmounts
        return () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking]);

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Optional: Select a specific voice if desired, or leave default
        // const voices = window.speechSynthesis.getVoices();
        // utterance.voice = voices.find(v => v.lang === 'en-US') || null;

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${styles.messageWrapper} ${isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper}`}
        >
            <div className={styles.messageContent}>
                <ReactMarkdown
                    components={{
                        code(props: any) {
                            const { node, inline, className, children, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <CodeBlock
                                    language={match[1]}
                                    value={String(children).replace(/\n$/, '')}
                                />
                            ) : (
                                <code className={styles.inlineCode} {...rest}>
                                    {children}
                                </code>
                            );
                        },
                        p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
                        ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
                        ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
                        li: ({ children }) => <li className={styles.listItem}>{children}</li>,
                        strong: ({ children }) => <strong className={styles.bold}>{children}</strong>,
                        em: ({ children }) => <em className={styles.italic}>{children}</em>,
                    }}
                >
                    {message.content}
                </ReactMarkdown>

                {!isUser && (
                    <div className={styles.messageFooter}>
                        <div className={styles.footerLeft}>
                            {message.response_time && (
                                <div className={styles.responseTime}>
                                    <FiZap size={14} className={styles.zapIcon} />
                                    <span>{message.response_time} ms</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.footerRight}>
                            <button
                                onClick={handleCopy}
                                className={styles.ttsButton}
                                title={copied ? "Copied!" : "Copy message"}
                            >
                                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                            </button>
                            <button
                                onClick={handleSpeak}
                                className={styles.ttsButton}
                                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                            >
                                {isSpeaking ? <FiStopCircle size={16} /> : <FiVolume2 size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
