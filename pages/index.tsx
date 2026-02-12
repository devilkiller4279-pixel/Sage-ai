import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCpu, FiImage, FiMic, FiShield, FiZap, FiMessageSquare } from 'react-icons/fi';
import styles from '../styles/Home.module.css';
import FloatingLines from '../components/FloatingLines';

export default function HomePage() {
    const chatbotName = process.env.NEXT_PUBLIC_CHATBOT_NAME || 'Sage Ai';
    const logoUrl = process.env.NEXT_PUBLIC_CHATBOT_LOGO_URL || 'https://cdn.discordapp.com/attachments/1302289054997676074/1470668373661581383/cropped_circle_image.png?ex=698c2227&is=698ad0a7&hm=62d9c49e171f97a1b38a2aa96770c3ea24762697d69110f5421547c89b54ddce&';

    return (
        <div className={styles.container}>
            <Head>
                <title>{chatbotName} - The Future of AI Conversation</title>
                <meta name="description" content="Experience the next generation of AI chat with image analysis, voice recognition, and lightning-fast responses." />
            </Head>

            <div className={styles.heroBackground}>
                <FloatingLines
                    linesGradient={['#6aefc9', '#4afa5c', '#30ef43']}
                    animationSpeed={0.5}
                    interactive={false}
                />
            </div>

            <main className={styles.content}>
                <nav className={styles.navbar}>
                    <div className={styles.logoArea}>
                        <img src={logoUrl} alt="Logo" className={styles.logo} />
                        <span className={styles.brandName}>{chatbotName}</span>
                    </div>
                    <div className={styles.navButtons}>
                        <Link href="/login">
                            <button className={styles.loginBtn}>Login</button>
                        </Link>
                        <Link href="/signup">
                            <button className={styles.signupBtn}>Sign Up</button>
                        </Link>
                    </div>
                </nav>

                <section className={styles.heroSection}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className={styles.badge}
                    >
                        
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={styles.title}
                    >
                        Conversations Beyond <span className="gradient-text">Limits.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className={styles.subtitle}
                    >
                        Experience the most powerful AI chatbot equipped with vision analysis,
                        voice processing, and instantaneous reasoning capabilities.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className={styles.ctaButtons}
                    >
                        <Link href="/signup">
                            <button className={styles.signupBtn}>Get Started for Free</button>
                        </Link>
                    </motion.div>
                </section>

                <div className={styles.featuresGrid}>
                    <FeatureCard
                        icon={<FiZap />}
                        title="Instant Responses"
                        description="Powered by Groq's LPU™ technology for lightning-fast inference and zero-latency conversations."
                        delay={0.8}
                    />
                    <FeatureCard
                        icon={<FiImage />}
                        title="Vision Intelligence"
                        description="Upload or paste images for deep analysis. Our AI understands context, objects, and text within visuals."
                        delay={0.9}
                    />
                    <FeatureCard
                        icon={<FiMic />}
                        title="Voice & Audio"
                        description="Natural speech-to-text and text-to-speech integration. Talk to your AI as naturally as a human."
                        delay={1.0}
                    />
                    <FeatureCard
                        icon={<FiShield />}
                        title="Secure & Private"
                        description="Your data is encrypted and handled with the highest security standards. Your privacy is our priority."
                        delay={1.1}
                    />
                    <FeatureCard
                        icon={<FiCpu />}
                        title="Advanced Models"
                        description="Access state-of-the-art LLMs including Llama 3 and Molmo for unparalleled accuracy and creativity."
                        delay={1.2}
                    />
                    <FeatureCard
                        icon={<FiMessageSquare />}
                        title="Smart Memory"
                        description="Maintains context across long conversations, remembering your preferences and past interactions."
                        delay={1.3}
                    />
                </div>
            </main>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
            className={styles.featureCard}
        >
            <div className={styles.iconWrapper}>
                {icon}
            </div>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDesc}>{description}</p>
        </motion.div>
    );
}
