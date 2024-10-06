import axios from 'axios';

export const useApi = () => {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    const baseURL = apiBase;
    // const storeUser = useStoreUser()
    const api = axios.create({
        baseURL,
        // headers: {
        //   Authorization: `Bearer ${storeUser.token}`
        // }
    });
    return api;
};
