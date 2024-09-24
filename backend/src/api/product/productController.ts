import { logger } from '@/common/utils/logger';
import { sortResultAdvanceSearch, sortResultSearch } from '@/common/utils/search-result-sort';
import { Request, Response, NextFunction } from 'express';
// import { Products } from "../models/Products"
// import { Questions } from "../models/Products"
import mongoose from 'mongoose';
import { Product } from './productModel';
import { Question } from '../question/questionModel';
// var path = require('path')

export const getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const serviceData = await Question.find({ product: req.params.id });
        res.status(200).send({ type: 'success', data: serviceData });
    } catch (err) {
        console.log(err);
        res.status(500).send({ type: 'error', message: err });
    }
};

export const searchQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchChars = req.body.val;
        const categoryId = req.body.categoryId;
        let query = {};
        if (categoryId != null) {
            //@ts-ignore
            query = { category: mongoose.Types.ObjectId(categoryId) };
        }
        const regex = new RegExp(searchChars, 'i');

        const result = await Product.aggregate([
            {
                $match: {
                    $or: [{ name: { $elemMatch: { val: regex } } }, { metaKeywords: { $elemMatch: { val: regex } } }],
                },
            },
            { $match: query },
            { $match: { isVisible: true } },
            { $match: { isAvailable: true } },
        ]);

        const sortedSearchResults = sortResultSearch(result, searchChars);

        res.status(200).send({ type: 'success', data: sortedSearchResults });
    } catch (err) {
        console.log(err);
        res.status(500).send({ type: 'error', message: err });
    }
};

export const loadSearchPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // res.sendFile(path.resolve('dist/index.html'))
        logger.info('serving dist/index.html');
    } catch (err) {
        logger.error('ERR loadSubcategories: ' + err);
        res.redirect('/404');
    }
};

export const advanceSearchQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.body.type;

        if (type == 'single') {
            const id = req.body.id;

            const products = await Product.find({ _id: id });
            // const mainCategory = await Catalog.findOne( {  })
            const similarProducts = await Product.find({
                $and: [{ category: products[0].category }, { _id: { $ne: products[0]._id } }],
            });

            return res.status(200).send({ type: 'success', data: products, similarProducts });
        } else {
            const searchChars = req.body.searchChar;
            const categoryId = req.body.categoryId;
            let query: any = {};
            if (categoryId != null && categoryId != 'null') {
                //@ts-ignore
                query = { category: mongoose.Types.ObjectId(categoryId) };
            }
            const regex = new RegExp(searchChars, 'gi');

            let result = await Product.aggregate([
                {
                    $match: {
                        $or: [
                            { name: { $elemMatch: { val: regex } } },
                            { metaKeywords: { $elemMatch: { val: regex } } },
                            { metaTitle: { $elemMatch: { val: regex } } },
                            { metaDesc: { $elemMatch: { val: regex } } },
                            { shortDesc: { $elemMatch: { val: regex } } },
                        ],
                    },
                },
                { $match: query },
                { $match: { isVisible: true } },
                { $match: { isAvailable: true } },
            ]);

            result = await sortResultAdvanceSearch(result, searchChars);

            return res.status(200).send({ type: 'success', data: result });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ type: 'error', message: err });
    }
};
