import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthResult {
    success: boolean;
    error?: string;
}

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<AuthResult>;
    signup: (username: string, email: string, password: string) => Promise<AuthResult>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
        }

        setLoading(false);
    };

    const login = async (username: string, password: string): Promise<AuthResult> => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const signup = async (username: string, email: string, password: string): Promise<AuthResult> => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/');
    };

    return { user, loading, login, signup, logout, checkAuth };
};
