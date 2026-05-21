import axios from 'axios';

// Configuração global do Axios
const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    withCredentials: true, // Crucial para enviar os cookies de sessão
});

// Intercetar os pedidos para adicionar automaticamente o token CSRF
api.interceptors.request.use(config => {
    // Tenta ler o cookie 'csrftoken' que o Django envia
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;