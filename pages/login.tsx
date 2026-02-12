import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '../lib/useAuth';
import styles from '../styles/Auth.module.css';

export default function Login() {
    const router = useRouter();
    const { user, loading, login } = useAuth();
    const [username, setUsername] = useState('');
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
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            router.push('/chat');
        } else {
            setError(result.error || 'Login failed');
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
                <title>{process.env.NEXT_PUBLIC_CHATBOT_NAME || 'CodeXGPT'} - Login</title>
                <meta name="description" content="AI Chatbot powered by Groq" />
                <link rel="icon" href={process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/icons/1301573144817045524/5d9c89de6514ef1459463a8f9950d050.png?size=1024'} />
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
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to continue</p>
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
                                placeholder="Enter your username"
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
                                placeholder="Enter your password"
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
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>Don't have an account?</p>
                        <button
                            onClick={() => router.push('/signup')}
                            className={styles.linkButton}
                            disabled={isLoading}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
