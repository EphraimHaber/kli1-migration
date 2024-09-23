import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
// import { Users } from "../models/Users";
// import { IUser } from '../interfaces/userInterface'
// import { IRate } from '../interfaces/ratesInterface'
import { IVerifyOptions } from 'passport-local';
import { CallbackError } from 'mongoose';
// import '../middleware/passport';
import { deleteImage, uploadImage } from '@/common/utils/cloudinaryApi';
import { Portfolio } from '../portfolio/portfolioModel';
import { Projects } from '../projects/projectModel';
import { Category } from '../Category/categoryModel';
import { Country, State, City } from 'country-state-city';
import { calcCrow } from '@/common/utils/geoCalc';
import { logger } from '@/common/utils/logger';
import { IUser } from './types';
import { IRate } from '../rate/types';
import { Users } from './userModel';
import { Rate } from '../rate/rateModel';

export const getUserPersonalFreelancerPages = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        let subcategory: string = '';
        if (req.params.subcategory) subcategory = req.params.subcategory;
        if (user.activeAccount == 'freelancer' || user.role == 'freelancer') {
            logger.info('serve dist/index.html');
            // res.sendFile(path.resolve('dist/index.html'))
        } else if (user.activeAccount == 'customer' || user.role == 'customer') {
            res.redirect('/personal-customer');
        } else {
            res.redirect('/error-account-type');
        }
    } catch (err) {
        logger.error('ERR getUserPersonalFreelancerPages: ' + err);
        res.redirect('/');
    }
};

export const getUserPersonalCustomerPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        let subcategory: string = '';
        if (req.params.subcategory) subcategory = req.params.subcategory;
        if (user.role == 'customer') {
            // res.sendFile(path.resolve('dist/index.html'));
            logger.info('serving dist/index.html');
        } else if (user.role == 'freelancer') {
            res.redirect('/personal-freelancer');
        } else {
            res.redirect('/error-account-type');
        }
    } catch (err) {
        logger.error('ERR getUserPersonalCustomerPages: ' + err);
        res.redirect('/');
    }
};

export const postUserData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        Users.findOne({ _id: user.id }, (err: NativeError, existingUser: IUser) => {
            if (err) return res.status(500).send({ type: 'error', message: err });
            return res.status(200).send({
                email: existingUser.email,
                name: existingUser.name,
                nameCompany: existingUser.nameCompany,
                phone: existingUser.phone,
                photo: existingUser.photo,
                langList: existingUser.langList,
                defaultLang: existingUser.defaultLang,
                country: existingUser.country,
                city: existingUser.city,
            });
        });
    } catch (err) {
        logger.error('ERR postUserData: ' + err);
        res.redirect('/');
    }
};

export const postAllUserData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        Users.findOne({ _id: user.id }, (err: NativeError, existingUser: IUser) => {
            if (err) return res.status(500).send({ type: 'error', message: err });
            return res.status(200).send({
                email: existingUser.email,
                name: existingUser.name,
                nameCompany: existingUser.nameCompany,
                phone: existingUser.phone,
                photo: existingUser.photo,
                langList: existingUser.langList,
                defaultLang: existingUser.defaultLang,
                country: existingUser.country,
                city: existingUser.city,
                specializationList: existingUser.specializationList,
                siteList: existingUser.siteList,
            });
        });
    } catch (err) {
        logger.error('ERR postUserData: ' + err);
        res.redirect('/');
    }
};

export const updateUserData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const newUserData = req.body;
        console.log('req.body: ', req.body);
        const user = req.context.user as IUser;
        Users.findOne({ _id: user.id }, (err: NativeError, existingUser: IUser) => {
            if (err) return res.status(500).send({ type: 'error', message: err });
            if (newUserData.password != undefined && newUserData.password != '') {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        res.status(500).send({ type: 'error', message: err });
                    }
                    bcrypt.hash(newUserData.password, salt, (err, hash) => {
                        if (err) {
                            logger.error(err);
                            res.status(500).send({ type: 'error', message: err });
                        }
                        if (hash !== '') {
                            newUserData.hashPassword = hash;
                            newUserData.password = salt;
                            console.log('password update');
                            updateData(user.id, newUserData);
                        } else {
                            console.log('password not update');
                            return res.status(500).send({ type: 'error', message: 'hash return empty value' });
                        }
                    });
                });
            } else {
                updateData(user.id, newUserData);
            }

            async function updateData(id: string, data: object): Promise<any> {
                console.log('newUserData: ', data);
                try {
                    await Users.updateOne({ _id: id }, data, {});
                    logger.info('success update user data');
                    const existingUser = await Users.findOne({ _id: user.id });
                    if (!existingUser) {
                        logger.error('ERR: updateUserData: ' + err);
                        return res.status(500).send({ type: 'error', message: err });
                    }
                    return res.status(200).send({
                        email: existingUser.email,
                    });
                } catch (e) {
                    logger.error('ERR: updateUserData: ' + err);
                    return res.status(500).send({ type: 'error', message: e });
                }
            }
        });
    } catch (err) {
        logger.error('ERR updateUserData: ' + err);
        res.redirect('/');
    }
};

export const uploadImageUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;

        // @ts-ignore
        Users.updateOne({ _id: user.id }, { photo: req.file.url }, {}, (err: NativeError, result) => {
            if (err) {
                logger.error('ERR: error update user data in uploadImageUser: ' + err);
                return res.status(500).send({ type: 'error', message: err });
            }
            // @ts-ignore
            res.send({ type: 'success', data: req.file.url });
        });
    } catch (err) {
        logger.error('ERR uploadImageUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const deleteImageUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const urlImageParts = req.body.url.split('/');
        const urlImage = urlImageParts[urlImageParts.length - 1].split('.')[0];
        console.log(urlImage);
        const result = await deleteImage(urlImage);
        try {
            Users.updateOne({ _id: user.id }, { photo: '/image/profile-photo.jpg' });
            res.send({ type: 'success', data: result });
        } catch (err) {
            logger.error('ERR: error update user data in uploadImageUser: ' + err);
            return res.status(500).send({ type: 'error', message: err });
        }
    } catch (err) {
        logger.error('ERR deleteImageUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const urlImage = req.body;
        console.log(urlImage.url);
        //let result = await deleteImage()
    } catch (err) {
        logger.error('ERR deleteImageUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getUsersSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const specializations = await Category.find({ 'name.1': { $exists: true } });
        if (!specializations) {
            return res.status(500).send({ type: 'error', message: 'not find categories' });
        }

        const result = {
            specializations,
        };

        return res.status(200).send({ type: 'success', result });
    } catch (err) {
        logger.error('ERR deleteImageUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getCustomerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.url.split('/')[3];

        console.log('user id: ', userId);

        // @ts-ignore
        const user = await Users.findOne({ _id: mongoose.Types.ObjectId(userId) });

        console.log('user: ', user);

        if (user != null && user != undefined) {
            if (user.isDelete && user.isDelete == true) {
                return res.status(200).send({ type: 'error', message: 'User has been deleted' });
            } else {
                return res.status(200).send({
                    type: 'success',
                    data: {
                        id: user._id,
                        name: user.name,
                        photo: user.photo,
                        customerRating: user.customerRating,
                        ratesList: user.ratesList,
                    },
                });
            }
        } else {
            return res.status(500).send({ type: 'error', message: 'User not find' });
        }
    } catch (err) {
        logger.error('ERR getCustomerUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getFreelancerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.url.split('/')[3];

        // @ts-ignore
        const user = await Users.findOne({ _id: mongoose.Types.ObjectId(userId) });

        // @ts-ignore
        const portfolio = await Portfolio.find({ userId: userId });

        if (user != null && user != undefined) {
            if (user.isDelete && user.isDelete == true) {
                return res.status(200).send({ type: 'error', message: 'User has been deleted' });
            } else {
                return res.status(200).send({
                    type: 'success',
                    data: {
                        name: user.name,
                        id: user._id,
                        photo: user.photo,
                        reviewsList: user.reviewsList,
                        ratesList: user.ratesList,
                        portfolio: portfolio,
                    },
                });
            }
        }
    } catch (err) {
        logger.error('ERR getFreelancerUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getFreelanceResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const result = await Users.findOne({ _id: user.id });

        if (!result) {
            logger.error('ERR getFreelanceResume: get empty user data');
            return res.status(500).send({ type: 'error', message: 'get empty user data' });
        }

        return res.status(200).send({ type: 'success', data: { resume: result.freelancerResume } });
    } catch (err) {
        logger.error('ERR getFreelanceResume: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const updateFreelanceResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const result = await Users.findOneAndUpdate({ _id: user.id }, { freelancerResume: data.resume });

        if (!result) {
            logger.error('ERR updateFreelanceResume: not update resume');
            return res.status(500).send({ type: 'error', message: 'not update resume' });
        }

        return res.status(200).send({ type: 'success', data: { resume: result } });
    } catch (err) {
        logger.error('ERR updateFreelanceResume: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const params = req.params;

        // @ts-ignore
        const result = await Portfolio.find({ userId: mongoose.Types.ObjectId(params.id) });

        if (!result) {
            logger.error('ERR getPortfolio: not find portfolio');
            return res.status(500).send({ type: 'error', message: 'not find portfolio' });
        }

        return res.status(200).send({ type: 'success', data: { portfolio: result } });
    } catch (err) {
        logger.error('ERR getPortfolio: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const uploadImagePortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('req.file.url: ', req.file);

        // @ts-ignore
        return res.status(200).send({ type: 'success', data: req.file.url });
    } catch (err) {
        logger.error('ERR uploadImageUser: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const addPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        var data = req.body;
        data['userId'] = user.id;

        console.log('data: ', data);

        const newPortfolio = new Portfolio(data);

        await newPortfolio.save();
        return res.status(200).send({ type: 'success', data: { portfolio: newPortfolio } });
    } catch (err) {
        logger.error('ERR addPortfolio: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const updatePortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;
        const id = data.id;
        delete data.id;

        const result = await Portfolio.findOneAndUpdate({ $and: [{ _id: id }, { userId: user.id }] }, data);

        if (!result) {
            logger.error('ERR updatePortfolio: not update resume');
            return res.status(500).send({ type: 'error', message: 'not update portfolio' });
        }

        return res.status(200).send({ type: 'success', data: { resume: result } });
    } catch (err) {
        logger.error('ERR updatePortfolio: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const removePortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const params = req.params;
        console.log('params: ', params);

        const result = await Portfolio.findOneAndDelete({ $and: [{ _id: params.id }, { userId: user.id }] });

        if (!result) {
            logger.error('ERR removePortfolio: not remove portfolio');
            return res.status(500).send({ type: 'error', message: 'not remove portfolio' });
        }

        return res.status(200).send({ type: 'success', data: { resume: result } });
    } catch (err) {
        logger.error('ERR removePortfolio: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getNotificationCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('notification func');
        const user = req.context.user as IUser;

        let projectRequest: IRate[] = [];

        let notificationList = {
            numb: 0,
            message: [],
            projectRequest,
        };

        const dataProject = await Projects.find({ $and: [{ status: 'selectFreelancer' }, { idСustomer: user.id }] });

        if (dataProject.length > 0) {
            const idProjects = dataProject.map((val) => val.id);
            const request = await Rate.find({ projectId: { $in: idProjects } });

            console.log('request: ', request);

            if (request.length > 0) {
                for (const val of request) {
                    notificationList.numb++;
                    notificationList.projectRequest.push(val);
                }
            }
        }

        console.log('notificationList: ', notificationList);

        res.status(200).send({
            type: 'success',
            data: {
                notificationList: notificationList,
            },
        });
    } catch (err) {
        logger.error('ERR getNotification: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getFreelancers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const dataRequest = req.body;
        //console.log('dataRequest: ', dataRequest)

        const categoryList = await Category.find({
            _id: {
                $in: dataRequest.categoryId,
            },
        });

        //console.log('categoryList: ', categoryList)

        let listCategoriesName: any = [];

        if (categoryList) {
            listCategoriesName = categoryList.map((el: any) => el.name.map((val: any) => val.val + '//' + el._id));
        }

        let arraysName: any = [];

        if (listCategoriesName.length > 0) {
            arraysName = [].concat.apply('', listCategoriesName);
        }

        let params = [{ role: 'freelancer' }, { specializationList: { $in: arraysName } }];

        let countryList: any[] = [];

        let geoFilter = {
            active: false,
            city: '',
            lat: 0,
            lng: 0,
            radius: 0,
        };

        const customer = await Users.findOne({ _id: dataRequest.params.customerId });

        //console.log(customer)

        if (customer) {
            if (dataRequest.params.onlyMyTown) {
                params.push(
                    // @ts-ignore
                    { city: customer.city },
                );
            } else if (dataRequest.params.onlyMyCountry) {
                params.push(
                    // @ts-ignore
                    { country: customer.country },
                );
            } else if (dataRequest.params.nearMeGeo) {
                //console.log('start geo search')
                const country = await Country.getAllCountries();
                countryList = country;
                const userCountry = country.filter((el) => el.name == customer.country);
                console.log(userCountry);
                const cities = await City.getCitiesOfCountry(userCountry[0].isoCode);
                // @ts-ignore
                const userCity = cities.filter((el) => el.name == customer.city);
                console.log(userCity);
                geoFilter.active = true;
                geoFilter.city = userCity[0].name;
                geoFilter.lat = Number(userCity[0].latitude);
                geoFilter.lng = Number(userCity[0].longitude);
                geoFilter.radius = dataRequest.params.geoValue;
            }

            if (dataRequest.params.rateSet) {
                params.push(
                    // @ts-ignore
                    { freelancerRating: { $gte: dataRequest.params.rateValue } },
                );
            }
        }

        //console.log('params: ', params)

        const resultSearchFreelancers = await Users.find({ $and: params });

        if (!resultSearchFreelancers) {
            logger.error('ERR getFreelancers: cant find freelancers');
            return res.status(500).send({ type: 'error', message: 'cant find freelancers' });
        }

        let freelancers: any[] = [];

        if (geoFilter.active) {
            for (let val of resultSearchFreelancers) {
                const dataCoutry = countryList.filter((el) => el.name == val.country);
                console.log('dataCoutry: ', dataCoutry);
                if (dataCoutry != undefined && dataCoutry.length > 0) {
                    //console.log('dataCoutry: ', dataCoutry)

                    // @ts-ignore
                    const listCities: any[] = City.getCitiesOfCountry(dataCoutry[0].isoCode);
                    const dataCity: any[] = listCities.filter((el) => el.name == val.city);

                    //console.log('dataCity: ', dataCity)

                    const distanceBetweenCities = await calcCrow(
                        {
                            lat: geoFilter.lat,
                            lng: geoFilter.lng,
                        },
                        {
                            lat: Number(dataCity[0].latitude),
                            lng: Number(dataCity[0].longitude),
                        },
                        geoFilter.radius,
                    );

                    if (distanceBetweenCities / 1000 <= geoFilter.radius) {
                        freelancers.push({
                            freelancer: val,
                            portfolio: [],
                        });
                    }

                    //console.log('distanceBetweenCities: ', distanceBetweenCities)
                }
            }
        } else {
            freelancers = resultSearchFreelancers.map((el) => {
                return {
                    freelancer: el,
                    portfolio: [],
                };
            });
        }

        //console.log('freelancers: ', freelancers.length)

        // @ts-ignore
        const freelancersIdList = freelancers.map((el) => el.freelancer._id);

        const portfolioUsers = await Portfolio.find({ userId: { $in: freelancersIdList } });

        //console.log('portfolioUsers: ', portfolioUsers)

        if (portfolioUsers) {
            freelancers.forEach((val) => {
                // @ts-ignore
                val.portfolio = portfolioUsers.filter((el) => el.userId.equals(val.freelancer._id));
            });
        }

        //console.log('freelancers: ', freelancers)

        return res.status(200).send({ type: 'success', freelancers });
    } catch (err) {
        logger.error('ERR getFreelancers: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getCountryOrCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataRequest = req.body;
        console.log('dataRequest country: ', dataRequest);

        if (!dataRequest.country) {
            const country = Country.getAllCountries();
            return res.status(200).send({ type: 'success', country });
        } else if (dataRequest.country != '') {
            const cities = City.getCitiesOfCountry(dataRequest.country);
            return res.status(200).send({ type: 'success', cities });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ type: 'error', message: err });
    }
};
