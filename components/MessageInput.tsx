import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPlus, FiMic, FiX, FiImage } from 'react-icons/fi';
import styles from '../styles/Chat.module.css';
import ElectricBorder from './ElectricBorder';

interface MessageInputProps {
    onSend: (content: string, image?: string) => void;
    disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!input.trim() && !selectedImage) || disabled || isLoading) return;

        const message = input.trim();
        const image = selectedImage || undefined;

        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            await onSend(message, image);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setSelectedImage(reader.result as string);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
            };

            recognition.start();
        } else {
            alert('Speech recognition is not supported in this browser.');
        }
    };

    return (
        <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
                {selectedImage && (
                    <div className={styles.imagePreviewInline}>
                        <img src={selectedImage} alt="Upload preview" className={styles.imagePreviewThumb} />
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className={styles.removeImageButtonInline}
                            title="Remove image"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isLoading}
                >
                    <FiPlus size={20} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={selectedImage ? "Add a caption..." : "Type your message..."}
                        className={styles.messageInput}
                        disabled={disabled || isLoading}
                        rows={1}
                    />

                    <div className={styles.rightButtons}>
                        <button
                            type="button"
                            className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
                            onClick={startListening}
                            disabled={disabled || isLoading}
                        >
                            <FiMic size={20} />
                        </button>

                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={(!input.trim() && !selectedImage) || disabled || isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.buttonSpinner}></span>
                            ) : (
                                <FiSend size={20} />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
