import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '@/api/api';
import { authTokenKey } from '@/lib/constants';
import { UserRegisterRequest, UserRole, User } from '@/types/User';
import { getErrorMessage } from '@/lib/utils';

interface AuthContextType {
    user: User | null;
    userId: number;
    isUserClient: boolean;
    isUserTrainer: boolean;
    isUserAdmin: boolean;
    setMeUser: () => Promise<User | null>;
    register: (user: UserRegisterRequest) => Promise<User | null>;
    login: (credentials: { email: string; password: string }) => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Computed properties
    const userId = user?.id || 0;
    const isUserClient = user?.role === UserRole.Client;
    const isUserTrainer = user?.role === UserRole.Trainer;
    const isUserAdmin = user?.role === UserRole.Admin;

    const setMeUser = useCallback(async (): Promise<User | null> => {
        try {
            const userData = await api.auth.me();
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
            return null;
        }
    }, []);

    const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
        try {
            const token = await api.auth.login({ email, password });
            if (token) {
                localStorage.setItem(authTokenKey, token);
                return await setMeUser();
            }
        } catch (error) {
            return getErrorMessage(error);
        }
    }, [setMeUser]);

    const register = useCallback(async (userData: UserRegisterRequest) => {
        try {
            const token = await api.auth.register(userData);
            if (token) {
                localStorage.setItem(authTokenKey, token);
                return await setMeUser();
            }
        } catch (error) {
            return getErrorMessage(error);
        }
    }, [setMeUser]);

    const logout = useCallback(() => {
        localStorage.removeItem(authTokenKey);
        setUser(null);
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem(authTokenKey);
            if (token) {
                await setMeUser();
            }
        };

        initializeAuth();
    }, [setMeUser]);

    const value: AuthContextType = {
        user,
        userId,
        isUserClient,
        isUserTrainer,
        isUserAdmin,
        setMeUser,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};