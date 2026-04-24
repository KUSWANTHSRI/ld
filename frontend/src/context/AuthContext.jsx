import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await authAPI.login({ email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return user;
        } catch (error) {
            console.warn("Backend not available, using mock login for UI demonstration.");
            
            let role = 'Employee';
            let name = 'Demo Employee';
            if (email.toLowerCase().includes('admin')) {
                role = 'Admin';
                name = 'Demo Admin';
            } else if (email.toLowerCase().includes('trainer')) {
                role = 'Trainer';
                name = 'Demo Trainer';
            }

            const mockUser = {
                id: `mock-${role.toLowerCase()}-123`,
                name: name,
                email: email,
                role: role,
                department: 'L&D'
            };
            localStorage.setItem('token', 'mock-jwt-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            return mockUser;
        }
    };

    const register = async (formData) => {
        const res = await authAPI.register(formData);
        return res.data;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
