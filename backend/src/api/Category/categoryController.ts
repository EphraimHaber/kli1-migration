import { Request, Response, NextFunction } from 'express';
import { Category } from './categoryModel';
import { logger } from '@/common/utils/logger';
import { getBreadcrumbCategories } from '@/common/utils/breadcrumb';
import { Product } from '../product/productModel';

export const getMainCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const allCategories = await Category.find({ isVisible: true, parentCategory: null });
        const adList = [];
        for (let i = 0; i < allCategories.length; i++) {
            adList.push(allCategories[i]._id);
        }
        const checkChild = await Category.find({ parentCategory: { $in: adList } });
        if (checkChild.length > 0) {
            for (let i = 0; i < allCategories.length; i++) {
                for (let x = 0; x < checkChild.length; x++) {
                    if (String(allCategories[i]._id) == String(checkChild[x].parentCategory)) {
                        allCategories[i].children = [checkChild[x]];
                    }
                }
            }
        }

        res.status(200).send({
            type: 'success',
            data: {
                categories: allCategories,
            },
        });
    } catch (err) {
        logger.error('ERR getAllCategories: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getAllCategories' });
    }
};

export const loadCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await Category.find({ _id: req.params.id });
        const checkChild = await Category.exists({ parentCategory: category[0]._id });
        // res.sendFile(path.resolve('dist/index.html'));
        logger.info('serving dist/index.html');
    } catch (err) {
        logger.error('ERR loadSubcategories: ' + err);
        res.redirect('/404');
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await Category.findOne({ _id: req.params.id });
        if (!category) {
            logger.error('ERR getAllCategories: category is not found');
            res.status(500).send({ type: 'error', message: 'ERR getAllCategories' });
            return;
        }
        const subCategories = await Category.find({ parentCategory: req.params.id });
        const listIdSubCategories = [];
        for (let i = 0; i < subCategories.length; i++) {
            listIdSubCategories.push(subCategories[i]._id);
        }
        const breadcrumb = await getBreadcrumbCategories(req.url, category);

        const products = await Product.find({
            $and: [
                { $or: [{ category: category._id }, { category: { $in: listIdSubCategories } }] },
                { isVisible: true },
                { isAvailable: true },
            ],
        });
        //const productsSubCategories = await Products.find()
        //var allProducts = products.concat(productsSubCategories)
        //var myData = allProducts;
        const allProducts = Array.from(new Set(products.map((p) => JSON.stringify(p)))).map((v) => JSON.parse(v));
        res.status(200).send({
            type: 'success',
            data: {
                categories: category,
                subCategories: subCategories,
                products: [],
                breadcrumb,
            },
        });
    } catch (err) {
        logger.error('ERR getAllCategories: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getAllCategories' });
    }
};

export const getTopCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await Category.find({ isVisible: true }).limit(10);
        // const category = await Category.find({ $and: [{ isVisible: true }, { parentCategory: null }] });

        // res.status(200).send({ type: 'success' });
        res.status(200).send({ type: 'success', data: category });
    } catch (err) {
        logger.error('ERR getTopCategories: ' + err);
        res.status(500).send({ type: 'error', message: err });
    }
};

export const getSubcategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.params.id != 'null') {
            const category = await Category.findOne({ $and: [{ _id: req.params.id }, { isVisible: true }] });
            if (!category) {
                logger.error('ERR getSubcategories: category not found');
                res.status(500).send({ type: 'error', message: 'ERR getSubcategories' });
                return;
            }
            const subcategories = await Category.find({
                $and: [{ parentCategory: category._id }, { isVisible: true }],
            });
            var listIdSubCategories = [];
            for (let i = 0; i < subcategories.length; i++) {
                listIdSubCategories.push(subcategories[i]._id);
            }

            if (listIdSubCategories.length == 0) {
                listIdSubCategories.push(category._id);
            }
            const products = await Product.find({
                $and: [
                    { $or: [{ category: category._id }, { category: { $in: listIdSubCategories } }] },
                    { isVisible: true },
                    { isAvailable: true },
                ],
            });
            //const productsSubCategories = await Products.find()
            //var allProducts = products.concat(productsSubCategories)
            //var myData = allProducts;
            // var allProducts = Array.from(new Set(products.map(JSON.stringify))).map(JSON.parse);
            const allProducts = Array.from(new Set(products.map((p) => JSON.stringify(p)))).map((v) => JSON.parse(v));

            var breadcrumb = await getBreadcrumbCategories(req.url, category);

            res.status(200).send({
                type: 'success',
                data: {
                    category,
                    subcategories,
                    listProduct: allProducts,
                    breadcrumb,
                },
            });
        } else {
            const subcategories = await Category.find({
                $and: [{ parentCategory: { $ne: null } }, { isVisible: true }],
            });
            res.status(200).send({
                type: 'success',
                data: {
                    subcategories,
                },
            });
        }

        /*

        var listIdSubcategories = []
        for(let i = 0; i < subcategories.length; i++){
            listIdSubcategories.push(subcategories[i]._id)
        }
        if(listIdSubcategories.length > 0){
            const listProducts = await Products.find({category: {$in: listIdSubcategories}})
            if(listProducts.length > 0){
                res.status(200).send({ type: 'success', data: {
                        category,
                        products,
                        products: products
                    }
                })
            } else {
                res.status(200).send({ type: 'success', data: {
                        category,
                        subcategories,
                        products: null
                    }
                })
            }
        } else {
            res.status(200).send({ type: 'success', data: {
                    category,
                    subcategories: null,
                    products: null
                }
            })
        }

         */
    } catch (err) {
        logger.error('ERR getSubcategories: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getSubcategories' });
    }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await Category.find({ isVisible: true });
        let mainCategories = category.filter((value) => value.parentCategory == null);
        let subCategories = category.filter((value) => value.parentCategory != null);
        for (let i = 0; i < subCategories.length; i++) {
            for (let j = 0; j < mainCategories.length; j++) {
                if (String(subCategories[i].parentCategory) == String(mainCategories[j]._id)) {
                    if (!mainCategories[j].children) {
                        throw new Error('');
                    }
                    mainCategories[j].children?.push(subCategories[i]);
                }
            }
        }
        res.status(200).send({ type: 'success', data: mainCategories });
    } catch (err) {
        logger.error('ERR getTopCategories: ' + err);
        res.status(500).send({ type: 'error', message: err });
    }
};
