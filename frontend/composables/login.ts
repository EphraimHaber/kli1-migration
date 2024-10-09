export const useConnectService = () => {
    const api = useApi();

    const login = async (email: string, password: string) => {
        return await api.post(`/auth/login`, { email: email, password: password });
    };

    const checkAuth = async () => {
        return await api.post(`/auth/checkAuth`, {});
    };

    const signup = async (data: SignupRequest) => {
        return await api.post(`/auth/signup`, data);
    };

    return {
        login,
        checkAuth,
        signup,
    };
};

export interface SignupRequest {
    registerEmail: string;
    registerPassword: string;
    confirmPassword: string;
    role: 'customer' | 'freelancer' | 'none';
}
