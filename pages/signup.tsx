import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '../lib/useAuth';
import styles from '../styles/Auth.module.css';

export default function Signup() {
    const router = useRouter();
    const { user, loading, signup } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/chat');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        const result = await signup(username, email, password);

        if (result.success) {
            router.push('/chat');
        } else {
            setError(result.error || 'Signup failed');
            setIsLoading(false);
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
                <title>{process.env.NEXT_PUBLIC_CHATBOT_NAME || 'CodeXGPT'} - Sign Up</title>
                <meta name="description" content="AI Chatbot powered by Groq" />
                <link rel="icon" href={process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/attachments/1302289054997676074/1470674002858213457/Futuristic_owl_logo_for_Sage_AI.png?ex=698c2766&is=698ad5e6&hm=069f4edcf4fc96f217849d90b80b51b15eda914d8bddf5368b1d1315d1922b72&'} />
            </Head>

            <div className={styles.container}>
                <div className={styles.backgroundGradient}></div>

                <div className={styles.card}>
                    <div className={styles.logoContainer}>
                        <Image
                            src={process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/attachments/1302289054997676074/1470674002858213457/Futuristic_owl_logo_for_Sage_AI.png?ex=698c2766&is=698ad5e6&hm=069f4edcf4fc96f217849d90b80b51b15eda914d8bddf5368b1d1315d1922b72&'}
                            alt="Logo"
                            width={80}
                            height={80}
                            className={styles.logo}
                        />
                        <h1 className={styles.title}>Create Account</h1>
                        <p className={styles.subtitle}>Join us today</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password (min 6 characters)"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.buttonSpinner}></span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>Already have an account?</p>
                        <button
                            onClick={() => router.push('/login')}
                            className={styles.linkButton}
                            disabled={isLoading}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
