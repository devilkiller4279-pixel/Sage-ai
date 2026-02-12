import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMessageSquare, FiTrash2, FiLogOut, FiChevronLeft } from 'react-icons/fi';
import styles from '../styles/Chat.module.css';

interface User {
    id: number;
    username: string;
    email: string;
}

interface Session {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

interface SidebarProps {
    sessions: Session[];
    currentSession: Session | null;
    onNewChat: () => void;
    onSelectSession: (id: number) => void;
    onDeleteSession: (id: number) => void;
    onLogout: () => void;
    isOpen: boolean;
    onToggle: () => void;
    user: User | null;
}

export default function Sidebar({
    sessions,
    currentSession,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onLogout,
    isOpen,
    onToggle,
    user
}: SidebarProps) {
    return (
        <>
            {!isOpen && (
                <button
                    className={`${styles.sidebarToggle} ${styles.sidebarToggleClosed}`}
                    onClick={onToggle}
                >
                    ☰
                </button>
            )}

            <motion.div
                className={styles.sidebar}
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <div className={styles.sidebarHeader}>
                    <Image
                        src={process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/icons/1301573144817045524/5d9c89de6514ef1459463a8f9950d050.png?size=1024'}
                        alt="Logo"
                        width={40}
                        height={40}
                        className={styles.sidebarLogo}
                    />
                    <h2>{process.env.NEXT_PUBLIC_CHATBOT_NAME || 'Sage Ai'}</h2>
                    <button
                        className={styles.sidebarCloseButton}
                        onClick={onToggle}
                    >
                        <FiChevronLeft size={24} />
                    </button>
                </div>

                <button className={styles.newChatButton} onClick={onNewChat}>
                    <FiPlus size={20} />
                    New Chat
                </button>

                <div className={styles.sessionsContainer}>
                    <AnimatePresence>
                        {sessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className={`${styles.sessionItem} ${currentSession?.id === session.id ? styles.activeSession : ''
                                    }`}
                                onClick={() => onSelectSession(session.id)}
                            >
                                <div className={styles.sessionIcon}><FiMessageSquare size={18} /></div>
                                <div className={styles.sessionContent}>
                                    <div className={styles.sessionTitle}>{session.title}</div>
                                    <div className={styles.sessionDate}>
                                        {new Date(session.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSession(session.id);
                                    }}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.creditsSection}>
                        <span className={styles.versionText}>
                            V 1.69
                        </span>
                        <span className={styles.creditsText}>
                            Credits – 
                            <a
                                href="https://discord.gg/UFmyB6BmBj"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.creditsLink}
                            >
                                Nightmare.dev
                            </a>
                        </span>
                    </div>
                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className={styles.userName}>{user?.username}</div>
                        </div>
                        <button className={styles.logoutButton} onClick={onLogout}>
                            <FiLogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
