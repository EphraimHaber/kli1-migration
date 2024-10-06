export const healthCheckService = () => {
    const api = useApi();

    const healthCheck = async () => {
        return await api.get('/health-check');
    };

    const login = async (email: string, password: string) => {
        return await api.post(`/auth/login`, { email: email, password: password });
    };

    return {
        healthCheck,
        login,
    };
};
