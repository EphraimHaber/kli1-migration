import { Category } from '@/api/category/categoryModel';
import { Product } from '@/api/product/productModel';

const breadcrumb: any = [];

export const getBreadcrumbCategories = async (url: string, thisCategory: any): Promise<any> => {
    try {
        if (breadcrumb.length != 0) {
            for (let i = 0; i < breadcrumb.length; i++) {
                if (breadcrumb[i].url == url) return breadcrumb[i];
            }
        }
        let result = await createBreadcrumbCat(url, thisCategory);
        return result;
    } catch (err) {
        console.log(err);
        return undefined;
    }
};

async function createBreadcrumbCat(url: string, thisCategory: any) {
    try {
        const checkType = await Product.exists({ category: thisCategory._id });
        if (checkType !== null) {
            thisCategory.parentCategory = true;
        }
        breadcrumb.push({
            url: url,
            dataBreadcrumb: JSON.stringify([
                {
                    url: url,
                    data: thisCategory,
                },
            ]),
        });
        if (thisCategory.parentCategory !== null) {
            let check = true;
            let dataCategory = await getCategory(thisCategory.parentCategory, breadcrumb[breadcrumb.length - 1]);
            while (check) {
                dataCategory = await getCategory(thisCategory.parentCategory, breadcrumb[breadcrumb.length - 1]);
                if (!dataCategory) {
                    check = false;
                }
            }
            if (dataCategory) {
                await getCategory(dataCategory.parentCategory, breadcrumb[breadcrumb.length - 1]);
            }
        }
        return breadcrumb[breadcrumb.length - 1];
    } catch (err) {
        console.log(err);
    }
}

async function getCategory(parentCategory: any, breadcrumbData: any) {
    try {
        if (parentCategory != null) {
            var dataCategory = await Category.findOne({ _id: parentCategory });
            // @ts-ignore
            var checkType = await Products.exists({ category: dataCategory._id });
            if (dataCategory) {
                var thisBreadcrumbList = JSON.parse(breadcrumbData.dataBreadcrumb);
                thisBreadcrumbList.unshift({
                    path: checkType ? 'subcategories/' + dataCategory._id : 'categories' + dataCategory._id,
                    data: dataCategory,
                });
                breadcrumbData.dataBreadcrumb = JSON.stringify(thisBreadcrumbList);
            }
            return dataCategory;
        }
    } catch (err) {
        console.log(err);
    }
}
