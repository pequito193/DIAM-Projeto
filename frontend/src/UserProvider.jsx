import { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Tenta ir buscar o utilizador atual ao carregar a aplicação
    useEffect(() => {
        api.get('user/')
            .then(response => {
                setUser(response.data);
            })
            .catch(() => {
                setUser(null); // Não está logado
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (username, password) => {
        await api.post('login/', { username, password });
        // Se o login tiver sucesso, vai buscar os dados do utilizador
        const response = await api.get('user/');
        setUser(response.data);
    };

    const logout = async () => {
        await api.get('logout/');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};