export const useConnectService = () => {
    const api = useApi();

    const login = async (email: string, password: string) => {
        return await api.post(`/auth/login`, { email: email, password: password });
    };

    const checkAuth = async () => {
        return await api.post(`/auth/checkAuth`, {});
    };

    return {
        login,
        checkAuth,
    };
};
