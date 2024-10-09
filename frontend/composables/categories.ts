export const useCategoriesService = () => {
    const api = useApi();

    const allCategories = async () => {
        return await api.post(`/allcategories`);
    };

    return {
        allCategories,
    };
};
