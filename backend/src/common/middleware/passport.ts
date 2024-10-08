import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { getUserByToken, Users } from '@/api/user/userModel';
import { IUser } from '@/api/user/types';
import { logger } from '../utils/logger';
import passportLocal from 'passport-local';
import FacebookStrategy from 'passport-facebook';
import GoogleAuthStrategy from 'passport-google-oauth20';
import _ from 'lodash';
import { env } from '../utils/envConfig';

const LocalStrategy = passportLocal.Strategy;
const FaceBookStrategy = FacebookStrategy.Strategy;
const GoogleStrategy = GoogleAuthStrategy.Strategy;

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, DOMAIN_NAME } = env;
const { GOOGLE_APP_ID, GOOGLE_APP_SECRET } = env;

passport.serializeUser<any, any>((req, user, done) => {
    done(undefined, user);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findById(id);
        if (user != undefined && user != null) {
            done(null, {
                id: user.id,
                role: user.role,
                tokenCheckedEmail: user.tokenCheckedEmail,
                name: user.name,
                photo: user.photo ? user.photo : '',
                activeAccount: user.activeAccount,
                isActive: user.isActive,
                country: user.country ? user.country : '',
                city: user.city ? user.city : '',
            });
        }
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email: string, password: string, done: any) => {
        console.log([`${email}`]);
        //let arrayEmail = email as const;
        //console.log(arrayEmail)
        Users.findOne({ $and: [{ email: { $in: [email] } }, { isDelete: false }] }, (err: NativeError, user: IUser) => {
            if (err) {
                console.log('err: ', err);
                return done(err);
            }
            if (!user) {
                return done(undefined, false, { message: `Email ${email} not found.` });
            }
            user.comparePassword(password, user.hashPassword, (err: Error, isMatch: boolean) => {
                if (err) {
                    console.log('err: ', err);
                    return done(err);
                }
                console.log('isMatch: ', isMatch);
                if (isMatch) {
                    return done(undefined, user);
                }
                return done(undefined, false, { message: 'Invalid email or password.' });
            });
        });
    }),
);

const makeid = async (length: number) => {
    let result: string = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

passport.use(
    new FaceBookStrategy(
        {
            clientID: FACEBOOK_APP_ID,
            clientSecret: FACEBOOK_APP_SECRET,
            callbackURL: `${DOMAIN_NAME}/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        async function (accessToken: any, refreshToken: any, profile: any, done: any) {
            try {
                if (!profile.emails) {
                    done({ type: 'Invalid email' });
                }
                let token = null;
                let result = await Users.findOne({
                    $or: [{ facebook_id: profile.id }, { email: profile.emails[0].value }],
                }).then(async (thisUser: any) => {
                    if (thisUser) {
                        token = await thisUser.generateJWT(thisUser._id, 1);
                        return thisUser.toAuth();
                    } else {
                        let email = profile.emails ? profile.emails[0].value || '' : '';
                        let user = {
                            facebook_id: profile.id,
                            name: [{ lang: 'en', val: profile.displayName }],
                            email: [profile.emails[0].value],
                            phone: [''],
                            role: 'none',
                            activeAccount: true,
                            password: await makeid(10),
                        };

                        const finalUser = new Users(user);
                        await finalUser.save().then(async () => {
                            token = await finalUser.generateJWT(finalUser._id, 1);
                            return finalUser.toAuth();
                        });
                        token = await finalUser.generateJWT(finalUser._id, 1);
                        return finalUser.toAuth();
                    }
                });
                done(null, result, token);
            } catch (err: any) {
                logger.error(err.toString());
                done(err, null, null);
            }
        },
    ),
);

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_APP_ID,
            clientSecret: GOOGLE_APP_SECRET,
            callbackURL: DOMAIN_NAME + '/auth/google/callback',
        },
        async function (accessToken: any, refreshToken: any, profile: any, cb: any) {
            try {
                let token = null;
                let result = await Users.findOne({
                    $or: [{ google_id: profile.id }, { email: profile.emails[0].value }],
                }).then(async (thisUser: any) => {
                    if (thisUser) {
                        token = await thisUser.generateJWT(thisUser._id, 1);
                        return thisUser.toAuth();
                    } else {
                        let email = profile.emails[0].value || '';
                        let user = {
                            google_id: profile.id,
                            name: [{ lang: 'en', val: profile.displayName }],
                            email: [email],
                            phone: [''],
                            role: 'none',
                            activeAccount: true,
                            password: await makeid(10),
                        };
                        const finalUser = new Users(user);
                        return finalUser.save().then(async () => {
                            token = await finalUser.generateJWT(finalUser._id, 1);
                            return finalUser.toAuth();
                        });
                    }
                });
                return cb(null, result, token);
            } catch (err: any) {
                logger.error(err.toString());
                return cb(err, null, null);
            }
        },
    ),
);

export const fetchUserFromToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization || '';
        let user = null;

        if (token) user = await getUserByToken(token.split(' ')[1]);
        if (user) {
            req.context.user = user;
            (req.context.user as any).auth_token = token;
        }

        next();
    } catch (err) {
        logger.error('unable to fetch get token');
        next(err);
    }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('check is auth');
    const token = '' + req.query?.token;
    let user = null;

    if (token) {
        user = await getUserByToken(token);
        if (user) {
            req.context.user = user;
            (req.context.user as any).auth_token = token;
        }
    }

    if (req.context.user) {
        user = req.context.user as IUser;

        if (user.tokenCheckedEmail != 'true') return res.redirect('http://' + req.headers.host + '/error-confirm-mail');
        return next();
    }
    res.status(500).redirect('/');
};

export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split('/').slice(-1)[0];
    const user = req.context.user as IUser;

    // if(user.tokenCheckedEmail != 'true') return res.redirect('http://' + req.headers.host + "/error-confirm-mail");
    if (_.find(user.auth_token, { kind: provider })) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};
