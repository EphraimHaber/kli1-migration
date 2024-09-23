import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { check, validationResult } from 'express-validator';
import { Users } from '../user/userModel';
// import { IUser } from '../interfaces/userInterface';
import { IVerifyOptions } from 'passport-local';
// import { sendMail, sendMailTest } from '../util/mailer';
import '../middleware/passport';
import { logger } from '@/common/utils/logger';
import { IUser } from '../user/types';
// import { logger.error } from '../util/logger';
import { getDateTime, getTime } from '@/common/utils/dateUtils';
import { sendMailTest } from '@/common/utils/mailer';
import Payment from '../payment/paymentModel';
import { Projects } from '../projects/projectModel';
// import { addNewFieldsToUsersRecords } from '../util/serviceUpdateDataDB';

// import { IPayments } from '../interfaces/paymentInterface';
// import Payment from '../models/Payments';
// import { Projects } from '../models/Projects';

export const getLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await check('email', 'Email is not valid').isEmail().run(req);
        await check('password', 'Password cannot be blank').isLength({ min: 1 }).run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            logger.error(errors.toString());
            res.status(403).send({ type: 'error', message: errors });
            return;
        }

        passport.authenticate('local', (err: Error, user: IUser, info: IVerifyOptions) => {
            if (err) {
                logger.error('ERR login user: ' + err);
                res.status(200).send({ type: 'error', message: 'err passport auth' });
                return;
            }

            if (!user) {
                logger.error('ERR fin user in DB: ' + err);
                res.status(200).send({ type: 'error', message: 'user not found' });
                return;
            }

            if (user.tokenCheckedEmail != 'true') {
                res.status(200).send({ type: 'error', message: 'not check email' });
                return;
            }

            req.login(user, async (err) => {
                if (err) {
                    logger.error(err.toString());
                    res.status(500).send({ type: 'error', message: err });
                    return;
                }
                //console.log("req.user: ", req.user);
                //res.status(200).send({ type: 'success', data: user })
                var randomNumber = Math.random().toString();
                randomNumber = randomNumber.substring(2, randomNumber.length);
                res.cookie('token', randomNumber, { maxAge: 900000 });

                const lastVisit = getDateTime();

                await Users.findOneAndUpdate({ id: user._id }, { lastVisit: new Date(lastVisit) });

                const token = await user.generateJWT(user._id, req.query.days);

                res.setHeader('Authorization', 'Bearer ' + token);

                res.status(200).send({
                    type: 'success',
                    data: {
                        id: user._id,
                        role: user.role,
                        name: user.name,
                        activeAccount: user.activeAccount ? user.activeAccount : user.role,
                        tokenCheckedEmail: user.tokenCheckedEmail,
                        isActive: user.isActive,
                        country: user.country ? user.country : '',
                        city: user.city ? user.city : '',
                        token: token,
                    },
                });

                if (user.role === 'customer') {
                    res.redirect('http://' + req.headers.host + '/personal-customer');
                } else if (user.role === 'freelancer') {
                    res.redirect('http://' + req.headers.host + '/personal-freelancer');
                } else {
                    res.redirect('http://' + req.headers.host + '/');
                }
            });
        })(req, res, next);
    } catch (err) {
        res.status(200).send({ type: 'error', message: err });
    }
};

export const addPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const payment = new Payment({
            freelancerName: req.body.freelancerName,
            freelancerEmail: req.body.freelancerEmail,
            paymentID: req.body.paymentID,
            ownerID: req.body.ownerID,
            projectID: req.body.projectID,
            paymentStatus: req.body.status,
            date: req.body.date,
            price: req.body.price,
            notes: '',
        });

        await Users.findOneAndUpdate(
            { _id: req.body.ownerID },
            { $push: { customerProjectList: [req.body.projectID] } },
        );
        await Users.findOneAndUpdate(
            { _id: req.body.freelancerID },
            { $push: { freelancerProjectList: [req.body.projectID] } },
        );
        try {
            await payment.save();
        } catch (e) {
            logger.error(e);
            // return res.status(500).send()
        }

        // await payment.save((err: any) => {
        //     if (err) {
        //         logger.error(err.toString());
        //         return res.status(500).send({ type: 'error', message: err });
        //     }
        // });
        await Projects.findOneAndUpdate({ _id: req.body.projectID }, { $set: { status: 'inProgress' } });
    } catch (err) {
        logger.error(err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id;

    try {
        const payments = await Payment.find({ projectID: projectId });
        return res.json(payments);
    } catch (e) {
        console.log('Payments :', e);
    }
};

export const updatePaymentCustomerStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const projectId = req.params.id;
    try {
        await Payment.findOneAndUpdate({ _id: projectId }, { isFreelencerAccept: 'Accepted' });
    } catch (e) {
        console.log('Payments :', e);
    }
};

export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        //console.log('req.body: ', req.body)
        await check('registerEmail', 'Email is not valid').isEmail().run(req);
        await check('registerPassword', 'Password must be at least 8 characters long').isLength({ min: 8 }).run(req);
        //await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
        //await sanitize("email").normalizeEmail({gmail_remove_dots: false}).run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            logger.error(errors.toString());
            res.status(401).send({ type: 'error', message: errors });
            return;
        }

        const dateTime = getDateTime();

        const user = new Users({
            email: req.body.registerEmail,
            password: req.body.registerPassword,
            name: req.body.registerName,
            phone: req.body.phone,
            role: req.body.role,
            activeAccount: req.body.role,
            photo: '/image/profile-photo.jpg',
            lastVisit: dateTime,
            freelancerRating: 0,
            customerRating: 0,
        });

        Users.findOne({ email: { $in: req.body.registerEmail[0] } }, async (err: NativeError, existingUser: IUser) => {
            if (err) {
                logger.error('ERR fin user in DB: ' + err);
                return res.status(500).send({ type: 'error', message: err });
            }
            if (existingUser) {
                //console.log("ERR: Account with that email address already exists");
                logger.error('ERR: Account with that email address already exists');
                return res.status(401).send({
                    type: 'error',
                    message: 'Account with that email address already exists',
                });
            }
            try {
                user.save();
            } catch (e) {
                logger.error(e);
                return res.status(500).send({ type: 'error', message: err });
            }
            // user.save((err: any) => {
            //     if (err) {
            //         logger.error(err.toString());
            //         return res.status(500).send({ type: 'error', message: err });
            //     }
            //     req.logIn(user, async (err) => {
            //         if (err) {
            //             logger.error('ERR: failed login after save user: ' + err);
            //             return res.status(500).send({ type: 'error', message: err });
            //         }
            //         let message: string = `
            //         <h3>Confirm your email</h3>
            //         <br><hr><br>
            //         <p>You have registered on Kli1. Please confirm your email address by following the link: </p>
            //         <a href="http://${req.headers.host}/auth/reg/checkEmail/${user.tokenCheckedEmail}">http://${req.headers.host}/auth/reg/checkEmail/${user.tokenCheckedEmail}</a>
            //         `;
            //         //let resultSend = await sendMail(''+ user.email[0] +'','Confirm your email on Kli1', ''+ message +'' )
            //         let resultSend = sendMailTest({
            //             mailAdress: user.email[0],
            //             subject: 'Confirm your email on Kli1',
            //             message: message,
            //         });
            //         if (resultSend)
            //             res.status(200).send({
            //                 type: 'success',
            //                 data: { id: user._id, token: user.auth_token, role: user.role },
            //             });
            //         else {
            //             logger.error('ERR: Error send verification letter by email ');
            //             res.status(500).send({
            //                 type: 'error',
            //                 message: 'error send verification letter by email',
            //             });
            //         }
            //     });
            // });
        });
    } catch (err) {
        logger.error('ERR postSignup: ' + err);
        res.status(500).send({ type: 'error', message: err });
    }
};

export const getConfirmMail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // console.log(req.path)
        //console.log("req.user: ", req.user);
        let tokenCheckEmail: string = req.path.replace('/auth/reg/checkEmail/', '');
        Users.findOne({ tokenCheckedEmail: tokenCheckEmail }, (err: NativeError, existingUser: IUser) => {
            if (err) {
                logger.error('ERR: failed confirm user mail: ' + err);
                res.redirect('/error');
            }

            if (existingUser) {
                Users.updateOne(
                    { tokenCheckedEmail: tokenCheckEmail },
                    { tokenCheckedEmail: 'true' },
                    (err: NativeError, res: any) => {
                        if (err) {
                            logger.error('ERR: update user tokenCheckedEmail: ' + err);
                            res.redirect('/error');
                        }
                        if (existingUser.role === 'customer') res.redirect('/personal-customer');
                        else if (existingUser.role === 'freelancer') res.redirect('/personal-freelancer');
                        else res.redirect('/error-account-type');
                    },
                );
            } else {
                res.redirect('/error');
            }
        });
    } catch (err) {
        logger.error('ERR getConfirmMail: ' + err);
        res.redirect('/error');
    }
};

export const logout = (req: Request, res: Response): void => {
    // req.logout();
    res.status(200).send({ type: 'success' });
};

export const serviceAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        // console.log('user: ', req)
        // console.log('req.context.user: ', req.context.user)

        req.login(user, async (err) => {
            if (err) {
                logger.error('ERR logIn serviceAuth: ' + err);
                //res.status(500).send({ type: 'error', message: err })
                res.redirect('/');
                return;
            }
            //console.log("req.user: ", req.user);
            //res.status(200).send({ type: 'success', data: user })
            const token = await user.generateJWT(user._id, 1);
            var randomNumber = Math.random().toString();
            randomNumber = randomNumber.substring(2, randomNumber.length);

            res.setHeader('Authorization', 'Bearer ' + token);
            res.cookie('token', randomNumber, { maxAge: 900000 });
            res.redirect('/auth-completion');
            //res.status(200).send({ type: 'success', data: {
            //        _id: user._id,
            //        role: user.role
            //    }
            //})

            //if(user.role == 'customer') res.redirect('http://' + req.headers.host + '/personal-customer')
            //else if (user.role == 'freelancer') res.redirect('http://' + req.headers.host + '/personal-freelancer')
            //else res.redirect('http://' + req.headers.host + '/')
            return;
        });
    } catch (err) {
        logger.error('ERR serviceAuth: ' + err);
        res.redirect('/');
    }
};

export const serviceAuthFacebook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('req.path: ', req.path);
        passport.authenticate('facebook', (err: any, user: Express.User, token: string) => {
            if (err) return console.log('ERR serviceAuthFacebook: ', err);
            if (!user) {
                return console.log('ERR serviceAuthFacebook. User not found : ', err);
                return res.redirect('/');
            }

            req.login(user, function (err) {
                if (err) return console.log(err);
                console.log('serviceAuthFacebook. User: ', user);
                res.setHeader('Authorization', 'Bearer ' + token);
                return res.redirect('/auth-completion?token=' + token);
            });
        })(req, res, next);
    } catch (err) {
        logger.error('ERR serviceAuthFacebook: ' + err);
        res.redirect('/');
    }
};

export const serviceAuthGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        passport.authenticate('google', (err: any, user: Express.User, token: string) => {
            if (err) return console.log('ERR serviceAuthGoogle: ', err);
            if (!user) {
                return console.log('ERR serviceAuthGoogle. User not found : ', err);
                return res.redirect('/');
            }
            req.login(user, function (err) {
                if (err) return console.log(err);
                res.setHeader('Authorization', 'Bearer ' + token);
                res.redirect('/auth-completion?token=' + token);
            });
        })(req, res, next);
    } catch (err) {
        logger.error('ERR serviceAuthGoogle: ' + err);
        res.redirect('/');
    }
};

export const roleCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const token = await user.generateJWT(user._id, 1);
        res.setHeader('Authorization', 'Bearer ' + token);
        if (user.role == undefined || user.role == 'none') {
            // res.status(200).sendFile(path.resolve('dist/index.html'));
            res.status(200);
        } else {
            res.redirect('/?token=' + token);
        }
    } catch (err) {
        logger.error('ERR roleCheck: ' + err);
        res.redirect('/');
    }
};

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.context.user) {
            const user = req.context.user as IUser;
            res.status(200).send({
                type: 'success',
                data: {
                    id: user.id,
                    role: user.role,
                    activeAccount: user.activeAccount ? user.activeAccount : user.role,
                    isActive: user.isActive ? user.isActive : true,
                    name: user.name,
                    photo: user.photo,
                    country: user.country ? user.country : '',
                    city: user.city ? user.city : '',
                },
            });
        } else {
            res.status(500).send({ type: 'error', message: 'user not auth' });
        }
    } catch (err) {
        logger.error('ERR checkAuth: ' + err);
        res.status(500).send({ type: 'error', message: 'user not auth' });
    }
};
