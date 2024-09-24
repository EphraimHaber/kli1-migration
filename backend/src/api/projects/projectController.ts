import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import mongoose, { Model } from 'mongoose';
import { Projects, ProjectType } from './projectModel';
import { IUser } from '../user/types';
import { getDateTime, getTime } from '@/common/utils/dateUtils';
import { logger } from '@/common/utils/logger';
import { sendMailTest } from '@/common/utils/mailer';
import { IRate } from '../rate/types';
import { Rate } from '../rate/rateModel';
import { AddRateUserParams, IProject } from './types';
import { Users } from '../user/userModel';
import { Comment } from '../comments/commentsModel';
import { mailChats } from '../mailChat/mailChatModel';
import { chatLists } from '../chatLists/chatListsModel';
import { Reviews } from '../reviews/reviewsModel';
import { makePaymentAndReserv } from '@/common/utils/payment';
import { sendMessage } from '@/common/utils/socket-functions';
import { Category } from '../category/categoryModel';

export const createNewProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const projectData = req.body;

        const project = new Projects({
            title: projectData.projectTitle,
            description: projectData.comment,
            date: getDateTime(),
            dateDeadline: projectData.date,
            idProducts: projectData.cartData.map((val: { id: string }) => {
                //@ts-ignore
                return mongoose.Types.ObjectId(val.id);
            }),
            idCategory: projectData.cartData.map((val: { categoryId: string }) => {
                //@ts-ignore
                return mongoose.Types.ObjectId(val.categoryId);
            }),
            idMainCategory: projectData.cartData.map((val: { mainCategoryId: string }) => {
                //@ts-ignore
                return mongoose.Types.ObjectId(val.mainCategoryId);
            }),
            //@ts-ignore
            idСustomer: mongoose.Types.ObjectId(user.id),
            specs: projectData.cartData.map((val: { items: object[] }) => {
                return val.items;
            }),
            data: projectData.cartData.map((val: { dataCard: string }) => {
                return val.dataCard;
            }),
            approximateBudget: projectData.approximate ? projectData.approximate : 0,
            lang: projectData.lang,
            deliveryAddress: projectData.delivery,
            dislikeUsers: [],
        });

        await project.save().catch((err) => {
            logger.error(err);
            return res.status(500).send({ type: 'error', message: err });
        });
        if (projectData.freelancersList.length > 0) {
            for (let val of projectData.freelancersList) {
                let projectInfo = '<ul>';

                for (let i = 0; i < projectData.cartData.length; i++) {
                    projectInfo += '<p><b>' + projectData.cartData[i].name + '</b></p><br>';
                    projectInfo += projectData.cartData[i].items.map((val: any) => {
                        return '<li>' + val.name + ':' + val.value + '</li>';
                    });
                    if (i == projectData.cartData.length - 1) {
                        projectInfo += '</ul>';
                    }
                }

                const date = new Date(projectData.date);
                let message: string = `
                <h3>New project in Kli1</h3>
                <br>
                <h4>${projectData.projectTitle}</h4>
                <br>
                <p>Description: ${projectData.comment}</p>
                <br>
                <p>Deadline: ${date.toISOString()}</p>
                <br>
                <p>Approximate budget: ${projectData.approximate}</p>
                <br><hr><br>
                <p>Project details: </p>
                <br>
                <h4>Category name: ${projectData.cartData[0].categoryName}</h4>
                <br><br><br>
                ${projectInfo}
                <br><hr><br>
                <p>Project by link: </p>
                <a href="${req.protocol}://${req.headers.host}/rates/freelancer?id=${project._id}">${req.protocol}://${req.headers.host}/rates/freelancer?id=${project._id}</a>
                `;
                // console.log('message: ', message)
                // console.log('projectData.freelancersList.email: ', val.email)
                let resultSend = sendMailTest({
                    mailAdress: val.email,
                    subject: 'New project in Kli1',
                    message: message,
                });
                //res.status(500).send({ type: 'error', message: 'test err'})
                //let resultSend = await sendMail(''+ val.email +'','New project in Kli1', ''+ message +'' )
            }
        }
        res.status(200).send({
            type: 'success',
            data: {
                dataProject: project,
            },
        });
    } catch (err) {
        console.log(err);
        logger.error('ERR createNewProject: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getAllCategories' });
    }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let params = req.query;
        const skipRecords =
            Number(params.page) > 1 ? Number(params.page) * Number(params.count) - Number(params.count) : 0;
        if (params.filter) {
            // @ts-ignore
            params.filter = params.filter.replace(/ /g, '');
        }
        let dataProject;
        let allProjectNumb;

        if (params.filter != '' && params.filter != 'undefined' && params.filter != undefined) {
            allProjectNumb = await Projects.countDocuments({
                $and: [
                    { status: { $nin: ['disable', 'complete', 'deleteProject', 'inProgress'] } },
                    {
                        $or: [
                            // @ts-ignore
                            { idCategory: { $all: [mongoose.Types.ObjectId(params.filter)] } },
                            // @ts-ignore
                            { idCategory: { $all: [mongoose.Types.ObjectId(params.filter)] } },
                        ],
                    },
                    // @ts-ignore
                    { dislikeUsers: { $ne: mongoose.Types.ObjectId(params.userId) } },
                ],
            });
        } else {
            allProjectNumb = await Projects.countDocuments({
                $and: [
                    { status: { $nin: ['disable', 'complete', 'deleteProject', 'inProgress'] } },
                    // @ts-ignore
                    { dislikeUsers: { $ne: mongoose.Types.ObjectId(params.userId) } },
                ],
            });
        }

        // console.log('allProjectNumb: ', allProjectNumb)

        if (params.hideDislikeProjects == 'true' && params.userId != '') {
            if (params.filter != '' && params.filter != 'undefined' && params.filter != undefined) {
                // @ts-ignore
                dataProject = await Projects.find({
                    $and: [
                        { status: { $nin: ['disable', 'complete', 'deleteProject', 'inProgress'] } },
                        {
                            $or: [
                                // @ts-ignore
                                { idCategory: { $all: [mongoose.Types.ObjectId(params.filter)] } },
                                // @ts-ignore
                                { idCategory: { $all: [mongoose.Types.ObjectId(params.filter)] } },
                            ],
                        },
                        // @ts-ignore
                        { dislikeUsers: { $ne: mongoose.Types.ObjectId(params.userId) } },
                    ],
                })
                    .sort({ date: -1 })
                    .skip(skipRecords)
                    .limit(Number(params.count));
            } else {
                // @ts-ignore
                dataProject = await Projects.find({
                    $and: [
                        { status: { $nin: ['disable', 'complete', 'deleteProject', 'inProgress'] } },
                        // @ts-ignore
                        { dislikeUsers: { $ne: mongoose.Types.ObjectId(params.userId) } },
                    ],
                })
                    .sort({ date: -1 })
                    .skip(skipRecords)
                    .limit(Number(params.count));
            }
        } else {
            if (params.filter != '' && params.filter != 'undefined' && params.filter != undefined) {
                dataProject = await Projects.find({
                    $and: [
                        { status: { $nin: ['disable', 'complete'] } },
                        {
                            $or: [
                                // @ts-ignore
                                { idCategory: { $all: [mongoose.Types.ObjectId(params.filter)] } },
                                // @ts-ignore
                                { idCategory: { $all: [mongoose.Types.ObjectId(params.filter)] } },
                            ],
                        },
                    ],
                })
                    .sort({ date: -1 })
                    .skip(skipRecords)
                    .limit(Number(params.count));
            } else {
                dataProject = await Projects.find({
                    status: { $nin: ['disable', 'complete', 'deleteProject', 'inProgress'] },
                })
                    .sort({ date: -1 })
                    .skip(skipRecords)
                    .limit(Number(params.count));
            }
        }

        // console.log('dataProject.length: ', dataProject.length)

        if (dataProject.length > 0) {
            res.status(200).send({
                type: 'success',
                data: {
                    dataProject: dataProject,
                    countRecords: allProjectNumb,
                },
            });
        } else {
            res.status(200).send({ type: 'error', message: 'getProjects return empty result' });
        }
    } catch (err) {
        logger.error('ERR getProjects: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getProjects: ' + err });
    }
};

export const getCustomerProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const dataProject = await Projects.find({
            $and: [
                { status: { $nin: ['disable', 'complete', 'deleteProject', 'inProgress'] } },
                { idСustomer: user.id },
            ],
        }).sort({ date: -1 });
        let result = [];

        if (dataProject.length > 0) {
            let projectRequest: IRate[] = [];

            const idProjects = dataProject.map((val) => val.id);
            const request = await Rate.find({ projectId: { $in: idProjects } });

            if (request.length > 0) {
                for (const val of dataProject) {
                    let project: IProject = val;
                    let rate: IRate[] = request.filter((el) => el.projectId == val.id);

                    result.push({
                        project,
                        rate,
                    });
                }
            } else {
                for (const val of dataProject) {
                    result.push({
                        project: val,
                        rate: null,
                    });
                }
            }

            res.status(200).send({
                type: 'success',
                data: {
                    dataProject: dataProject,
                    result: result,
                    ownerProject: true,
                },
            });
        } else {
            res.status(200).send({ type: 'error', message: 'getCustomerProject return empty result' });
        }
    } catch (err) {
        logger.error('ERR getCustomerProject: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getCustomerProject: ' + err });
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let params = req.params.id;

        const userData = await Users.findOne({ _id: params });

        res.status(200).send({
            type: 'success',
            data: userData,
        });
    } catch (e) {}
};

export const getProjectInWork = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const ids =
            req.body.userRole === 'customer'
                ? user.customerProjectList.map((el) => String(el))
                : user.freelancerProjectList.map((el) => String(el));
        console.log({ userBody: req.body.userRole });

        const dataProject = await Projects.find({
            $and: [
                { status: { $nin: ['disable', 'complete', 'deleteProject', 'selectFreelancer'] } },
                { _id: { $in: ids } },
            ],
        });

        let result = [];

        if (dataProject.length > 0) {
            let projectRequest: IRate[] = [];

            const idProjects = dataProject.map((val) => val.id);
            const request = await Rate.find({ $and: [{ projectId: { $in: idProjects } }, { status: 'selected' }] });

            if (request.length > 0) {
                for (const val of dataProject) {
                    let project: IProject = val;
                    let rate: IRate[] = request.filter((el) => el.projectId == val.id);

                    result.push({
                        project,
                        rate,
                    });
                }
            }

            res.status(200).send({
                type: 'success',
                data: {
                    dataProject: dataProject,
                    result: result,
                    ownerProject: true,
                },
            });
        } else {
            res.status(200).send({ type: 'error', message: 'getCustomerProject return empty result' });
        }
    } catch (err) {
        logger.error('ERR getCustomerProject: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getCustomerProject: ' + err });
    }
};

export const getUsersProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const params = req.query;

        const dataProject = await Projects.findOne({
            $and: [
                // @ts-ignore
                { _id: mongoose.Types.ObjectId(params.id) },
                { idСustomer: user.id },
                { status: { $ne: 'deleteProject' } },
                { status: { $ne: 'inProgress' } },
                { status: { $ne: 'complete' } },
            ],
        });

        if (dataProject === null) {
            res.status(500).send({ type: 'error', message: 'Not find dataProject' });
            return;
        }
        const userData = await Users.findOne({ _id: user.id });
        if (!userData) {
            res.status(404).send({ type: 'error', message: 'Not find userData' });
            return;
        }
        const category = await Category.findOne({ _id: dataProject.idCategory[0] });
        if (!category) {
            res.status(404).send({ type: 'error', message: 'Not find category' });
            return;
        }

        const rates = await Rate.find({
            $and: [{ projectId: dataProject.id }, { isDelete: false }],
        });
        const ratesData = [];

        if (rates.length > 0) {
            const res = [];
            const idRateUsers = rates.map((val) => val.freelancerId);
            const rateUser = await Users.find({ _id: { $in: idRateUsers } });

            for (let val of rates) {
                ratesData.push({
                    user: rateUser
                        // @ts-ignore
                        .filter((el) => el._id.equals(val.freelancerId))
                        .map((thisVal) => {
                            return {
                                id: thisVal._id,
                                name: thisVal.name,
                                photo: thisVal.photo,
                                email: thisVal.email[0],
                            };
                        }),

                    rate: val,
                });
            }
            ratesData.sort((a, b) => a.rate.stepNumber - b.rate.stepNumber);
        }

        const comments = await chatLists.find({
            $and: [{ projectId: params.id }, { type: 'comment' }],
        });

        const commentData = [];

        if (comments.length > 0) {
            // @ts-ignore
            const idCommentsUsers = comments.map((val) => val.usersId.map((id) => mongoose.Types.ObjectId(id)));
            // @ts-ignore
            const mergedIdUsers = [].concat.apply([], idCommentsUsers);
            // console.log('mergedIdUsers: ', mergedIdUsers)
            // @ts-ignore
            const commentUser = await Users.find({ _id: { $in: mergedIdUsers } });

            // console.log('commentUser: ', commentUser)

            for (let val of comments) {
                const listenerId = val.usersId.filter((el) => el != user.id);

                const listenerData = await Users.findOne({ _id: listenerId[0] });

                if (!listenerData) {
                    res.status(404).send();
                    return;
                }

                const lastMail = await mailChats.find({ chatRoomId: val._id }).sort({ createdAt: -1 }).limit(1);

                commentData.push({
                    user: {
                        id: listenerData._id,
                        name: listenerData.name,
                        photo: listenerData.photo,
                    },
                    idRoom: val._id,
                    commentText: lastMail[0].text,
                    comment: lastMail,
                });
            }
        }

        res.status(200).send({
            type: 'success',
            data: {
                project: dataProject,
                owner: {
                    name: userData.name,
                    img: userData.photo,
                    id: userData._id,
                },
                category: {
                    name: category.name,
                    id: category.id,
                    icon: category.icon ? category.icon.src : '',
                },
                ratesData,
                commentData,
            },
        });
    } catch (err) {
        logger.error('ERR getManyProjects: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getAllCategories' });
    }
};

export const getOneProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        var params = req.params;

        if (params.id == undefined) {
            // @ts-ignore
            params = req.query;
        }

        // @ts-ignore
        const dataProject = await Projects.findOne({ _id: mongoose.Types.ObjectId(params.id) });
        if (!dataProject) {
            res.status(404).send();
            return;
        }

        // console.log('dataProject: ', dataProject)

        const userData = await Users.findOne({ _id: dataProject.idСustomer });
        if (!userData) {
            res.status(404).send();
            return;
        }

        const category = await Category.findOne({ _id: dataProject.idCategory[dataProject.idCategory.length - 1] });
        if (!category) {
            res.status(404).send();
            return;
        }

        // console.log('category: ', category)

        res.status(200).send({
            type: 'success',
            data: {
                project: dataProject,
                owner: {
                    name: userData.name,
                    id: userData._id,
                    img: userData.photo,
                },
                category: {
                    name: category ? category.name : '',
                    id: category ? category.id : '',
                    icon: category.icon ? category.icon.src : '',
                },
            },
        });
    } catch (err) {
        logger.error('ERR getOneProject: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR getOneProject' });
    }
};

export const removeProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const params = req.query;

        const project = await Projects.findOneAndUpdate(
            // @ts-ignore
            { $and: [{ _id: mongoose.Types.ObjectId(params.id) }, { idСustomer: mongoose.Types.ObjectId(user.id) }] },
            { status: 'deleteProject' },
        );

        if (project != null && project != undefined) {
            res.status(200).send({ type: 'success', data: project });
        } else {
            res.status(200).send({ type: 'error', data: 'not find project' });
        }
    } catch (err) {
        logger.error('ERR removeProject: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR removeProject' });
    }
};

export const getRateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        let rate = await Rate.find({ $and: [{ freelancerId: user.id }, { projectId: data.id }] });

        rate = rate.sort((a, b) => a.stepNumber - b.stepNumber);
        console.log('user rate: ', rate);

        if (rate != null && rate != undefined) {
            const userData = await Users.findOne({ _id: user.id });

            res.status(200).send({
                type: 'success',
                data: {
                    rate: rate,
                    user: {
                        name: userData?.name,
                        photo: userData?.photo,
                    },
                },
            });
        } else {
            res.status(200).send({ type: 'error', data: 'not find rate user' });
        }
    } catch (err) {
        logger.error('ERR getRateUser: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR getRateUser' });
    }
};

export const getAllRateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('DATA GETALL');

        const user = req.context.user as IUser;
        const rates = await Rate.find({ $and: [{ freelancerId: user.id }, { isDelete: false }] });

        if (rates != null && rates != undefined) {
            const projectIdList = rates.map((val) => val.projectId);

            const projectData = await Projects.find({ _id: projectIdList });

            const result = [];

            for (const val of rates) {
                //@ts-ignore
                const thisProject = projectData.filter((el) => el._id.equals(val.projectId));
                if (thisProject.length > 0 && thisProject[0].status == 'selectFreelancer') {
                    result.push({
                        project: thisProject[0],
                        rate: val,
                    });
                }
            }

            res.status(200).send({
                type: 'success',
                data: {
                    result,
                },
            });
        } else {
            res.status(200).send({ type: 'error', data: 'not find rate user' });
        }
    } catch (err) {
        logger.error('ERR getRateUser: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR getRateUser' });
    }
};

export const getProjectRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const params = req.params;

        let rates = await Rate.find({ projectId: params.id });

        rates = rates.sort((a, b) => a.stepNumber - b.stepNumber);

        if (!rates) {
            res.status(200).send({ type: 'error', message: 'not find project rates' });
        }

        const usersIdList = rates.map((val) => val.freelancerId);
        const users = await Users.find({ _id: usersIdList });
        if (!users) {
            res.status(200).send({ type: 'error', message: 'cant get users' });
        }

        let result = [];

        for (let x = 0; x < rates.length; x++) {
            for (let y = 0; y < users.length; y++) {
                if (String(users[y]._id) == String(rates[x].freelancerId)) {
                    result.push({
                        rate: rates[x],
                        photo: users[y].photo,
                        name: users[y].name,
                    });
                }
            }
        }

        res.status(200).send({ type: 'success', data: result });
    } catch (err) {
        logger.error('ERR getProjectRates: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR getProjectRates' });
    }
};

export const addRateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        var params = req.params;
        var data = req.body;

        const rate = new Rate({
            projectId: params.id,
            freelancerId: data.freelancerId,
            rates: data.rate,
            term: data.term,
            comment: data.comment,
            date: getDateTime(),
            currencyType: 'USD',
            stepNumber: data.id,
            position: 0,
        });

        console.log('rate', rate);

        const projectId = params.id;
        const freelancerId: number = data.freelancerId;
        const resolvedData = (data.rates as AddRateUserParams[]).map((rateData) => {
            const date = getDateTime();
            return new Rate({
                projectId: projectId,
                freelancerId: freelancerId,
                rates: rateData.rate,
                term: rateData.deadline,
                comment: rateData.comment,
                date: date,
                currencyType: 'USD',
                position: 0,
                name: rateData.name,
                stepNumber: rateData.stepNumber,
            });
        });

        const updateProjectIdRate = async (tampRate: mongoose.Document<unknown, {}, IRate>) => {
            await tampRate.save();
            await Projects.findByIdAndUpdate({ _id: params.id }, { $push: { ratesIdList: [rate._id] } });
            res.status(200).send({ type: 'success', data: { rate: tampRate } });
        };
        const updateProjectIdRateList = async (rates: mongoose.Document<unknown, {}, IRate>[]) => {
            for (let i = 0; i < rates.length; i++) {
                const element = rates[i];
                await updateProjectIdRate(element);
            }
        };

        try {
            await updateProjectIdRateList(resolvedData);
        } catch (e) {
            logger.error(e);
            res.status(500).send({ type: 'error', message: e });
            // return res.status(500).send({ type: 'error', message: err });
        }
    } catch (err) {
        logger.error('ERR getRateUser: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR getRateUser' });
    }
};

export const updateProjectRatesStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        var data = req.body;

        const newRate = await Rate.findOneAndUpdate(
            { _id: data.id },
            {
                status: data.status,
                name: 'steep 2',
            },
        );

        if (!newRate) {
            res.status(200).send({ type: 'error', message: 'not update project rates' });
        }

        res.status(200).send({ type: 'success', data: newRate });
    } catch (err) {
        logger.error('ERR updateProjectRates: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR updateProjectRates' });
    }
};

export const updateProjectRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        var data = req.body;
        const newRate = await Rate.findOneAndUpdate(
            { $and: [{ _id: data.id }, { freelancerId: user.id }] },
            {
                name: data.stepName,
                rates: data.rate,
                term: data.deadline,
                comment: data.comment,
                status: data.status,
            },
        );

        if (!newRate) {
            res.status(200).send({ type: 'error', message: 'not update project rates' });
        }

        res.status(200).send({ type: 'success', data: newRate });
    } catch (err) {
        logger.error('ERR updateProjectRates: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR updateProjectRates' });
    }
};

export const deleteProjectRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        var params = req.params;
        const body = req.body;

        const rate = await Rate.findOne({ $and: [{ projectId: params.id }, { freelancerId: user.id }] });

        const newRate = await Rate.findOneAndDelete({ $and: [{ _id: body.rateId }, { freelancerId: user.id }] });

        if (!newRate) {
            res.status(200).send({ type: 'error', message: 'not delete project rates' });
        }

        const deleteRateOnProject = await Projects.findOneAndUpdate(
            { _id: rate?.projectId },
            { $pull: { ratesIdList: rate?._id } },
        );
        // console.log('deleteRateOnProject: ', deleteRateOnProject)

        res.status(200).send({ type: 'success', data: newRate });
    } catch (err) {
        logger.error('ERR deleteProjectRates: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR deleteProjectRates' });
    }
};

export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const params = req.params;

        const chatRooms = await chatLists.findOne({
            $and: [{ usersId: user.id }, { projectId: params.id }, { type: 'comment' }],
        });

        const result = [];

        if (chatRooms != null) {
            const mailsAllCount = mailChats.countDocuments({ chatRoomId: chatRooms._id });

            const mailsAllCountNotRead = await mailChats.countDocuments({
                $and: [{ chatRoomId: chatRooms._id }, { read: false }],
            });

            const listenerId = chatRooms.usersId.filter((el) => el != user.id);

            const listenerData = await Users.findOne({ _id: listenerId[0] });

            const lastMail = await mailChats.find({ chatRoomId: chatRooms._id }).sort({ createdAt: -1 }).limit(1);

            if (listenerData != null && lastMail.length > 0) {
                result.push({
                    id: chatRooms._id,
                    img: listenerData.photo,
                    name: listenerData.name[0].val,
                    date:
                        lastMail[0].date.getFullYear() +
                        '-' +
                        (lastMail[0].date.getMonth() < 10
                            ? '0' + (lastMail[0].date.getMonth() + 1)
                            : lastMail[0].date.getMonth() + 1) +
                        '-' +
                        (lastMail[0].date.getDay() + 1),
                    time: lastMail[0].date.getHours() + ':' + lastMail[0].date.getMinutes(),
                    desc: lastMail[0].text,
                    count: mailsAllCount,
                    read: mailsAllCountNotRead > 0 ? false : true,
                });
            }
            res.status(200).send({ type: 'success', result });
        } else {
            res.status(500).send({ type: 'error', message: 'not find chatRooms for comment' });
        }
    } catch (err) {
        logger.error('ERR getComments: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR getComments' });
    }
};

export const getCommentsOwnerProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        var params = req.params;

        const chatRooms = await chatLists.find({
            $and: [{ usersId: user.id }, { projectId: params.id }, { type: 'comment' }],
        });

        if (chatRooms != null) {
            const result = [];

            for (let [index, val] of chatRooms.entries()) {
                const mailsAllCount = await mailChats.countDocuments({ chatRoomId: val._id });

                const mailsAllCountNotRead = await mailChats.countDocuments({
                    $and: [{ chatRoomId: val._id }, { read: false }],
                });

                const listenerId = val.usersId.filter((el) => el != user.id);

                const listenerData = await Users.findOne({ _id: listenerId[0] });

                const lastMail = await mailChats.find({ chatRoomId: val._id }).sort({ createdAt: -1 }).limit(1);

                if (listenerData != null && lastMail.length > 0) {
                    result.push({
                        id: val._id,
                        img: listenerData.photo,
                        name: listenerData.name[0].val,
                        date:
                            lastMail[0].date.getFullYear() +
                            '-' +
                            (lastMail[0].date.getMonth() < 10
                                ? '0' + (lastMail[0].date.getMonth() + 1)
                                : lastMail[0].date.getMonth() + 1) +
                            '-' +
                            (lastMail[0].date.getDay() + 1),
                        time: lastMail[0].date.getHours() + ':' + lastMail[0].date.getMinutes(),
                        desc: lastMail[0].text,
                        count: mailsAllCount,
                        read: mailsAllCountNotRead > 0 ? false : true,
                    });
                }
            }

            res.status(200).send({ type: 'success', result });
        } else {
            res.status(500).send({ type: 'error', message: 'not find chatRooms for comments' });
        }
    } catch (err) {
        logger.error('ERR getCommentsOwnerProject: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR getCommentsOwnerProject' });
    }
};

export const addNewComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        // console.log('data: ', data)

        const chatRoom = await chatLists.findOne({
            $and: [{ usersId: { $in: [user.id, data.userId] } }, { type: 'comment' }, { projectId: data.projectId }],
        });

        if (!chatRoom) {
            const newChatList = new chatLists({
                creatorId: user.id,
                usersId: [user.id, data.customerId],
                projectId: data.id,
                status: 'active',
                type: data.typeChat ? data.typeChat : 'comment',
                date: getDateTime(),
            });
            await newChatList.save().catch((err) => {
                logger.error(err);
                return res.status(500).send({ type: 'error', message: err });
            });
            // console.log('newChatList: ', newChatList)

            const newMail = new mailChats({
                senderId: user.id,
                chatRoomId: newChatList._id,
                listenerId: [data.customerId],
                nameUserSender: user.name[0].val,
                photoUserSender: user.photo ? user.photo : '/image/profile-photo.jpg',
                typeMail: 'personal',
                text: data.comment,
                serialNumber: 1,
                read: false,
                date: getDateTime(),
                time: getTime(data.timeZone ? data.timeZone : undefined),
            });
            await newMail.save().catch((err) => {
                logger.error('ERR save newMail: ' + err);
                return res.status(500).send({ type: 'error', message: err });
            });
            sendMessage(data.listenerId, user.id, data.text, newChatList._id);

            return res.status(200).send({ type: 'success', chatRoom: newChatList });
        } else {
            return res.status(200).send({ type: 'success', chatRoom });
        }
    } catch (err) {
        logger.error('ERR addComment: ' + err);
        console.log(err);
        res.status(500).send({ type: 'error', message: 'ERR addComment' });
    }
};

/*
export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.context.user as IUser;
    var data = req.body

    const comment = await new Comment({
      userId: user.id,
      projectId: data.id,
      thread: '0',
      text: data.comment,
      date: moment(new Date()).format('YYYY-MM-DD[T00:00:00.000Z]'),
      position: data.position
    })

    comment.save((err) => {
      if (err) {
        logger.error(err.toString())
        return res.status(500).send({ type: 'error', message: err })
      }

      console.log('comment: ', comment)
      res.status(200).send({ type: 'success', data: {
          comment: comment
        }
      })
    })
  } catch (err) {
    logger.error("ERR addComment: " + err);
    console.log(err)
    res.status(500).send({type: 'error', message: 'ERR addComment' })
  }
}
*/

export const removeComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.context.user as IUser;
        const params = req.params;

        const result = await Comment.findOneAndDelete({
            $and: [{ userId: user.id }, { _id: params.id }],
        });

        if (!result) {
            res.status(200).send({ type: 'error', message: 'not delete comment' });
        }

        res.status(200).send({ type: 'success', data: result });
    } catch (err) {
        logger.error('ERR removeComment: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR removeComment' });
    }
};

export const paymant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        var data = req.body;

        console.log('data paymant: ', data);

        const resultPaymant = await makePaymentAndReserv({
            userId: data.userData.id,
            price: data.userData.price,
            cardData: data.cartData,
        });

        if (resultPaymant.type == 'success') {
            // console.log('data.userData.id: ', data.userData.id)
            // console.log('data.userData.projectId: ', data.userData.projectId)

            const updateProject = await Projects.findOneAndUpdate(
                { _id: data.userData.projectId },
                { $set: { status: 'inProgress' } },
            );

            // console.log('updateProject.idСustomer: ', updateProject.idСustomer)

            const chatComments = await chatLists.findOneAndUpdate(
                {
                    $and: [
                        { creatorId: data.userData.id },
                        { projectId: data.userData.projectId },
                        { type: 'comment' },
                    ],
                },
                { $set: { type: 'project', creatorId: updateProject?.idСustomer } },
            );

            // console.log('chatComments: ', chatComments)

            if (chatComments) {
                const updateProject = await Projects.findOneAndUpdate(
                    { _id: data.userData.projectId },
                    { $set: { chatsIdList: [chatComments._id] } },
                );

                const rateUpdate = await Rate.findOneAndUpdate(
                    { _id: data.userData.oferId },
                    { $set: { status: 'selected' } },
                );

                const rateUpdateAll = await Rate.updateMany(
                    { _id: { $nin: data.userData.oferId } },
                    { $set: { status: 'ignored' } },
                );

                return res.status(200).send({ type: 'success', chatRoom: chatComments });
            } else {
                const newChatProject = new chatLists({
                    creatorId: data.userData.ownerId,
                    usersId: [data.userData.id, data.userData.ownerId],
                    projectId: data.userData.projectId,
                    status: 'active',
                    type: 'project',
                    date: getDateTime(),
                });
                await newChatProject.save().catch((err) => {
                    logger.error(err);
                    return res.status(500).send({ type: 'error', message: err });
                });
                const updateProject = await Projects.findOneAndUpdate(
                    { _id: data.userData.projectId },
                    { $set: { chatsIdList: [newChatProject._id] } },
                );

                const rateUpdate = await Rate.findOneAndUpdate(
                    { _id: data.userData.oferId },
                    { $set: { status: 'selected' } },
                );

                const rateUpdateAll = await Rate.updateMany(
                    { _id: { $nin: data.userData.oferId } },
                    { $set: { status: 'ignored' } },
                );

                return res.status(200).send({ type: 'success', chatRoom: newChatProject });
            }
        } else {
            res.status(500).send({ type: 'error', message: resultPaymant.message });
        }
    } catch (err) {
        logger.error('ERR paymant: ' + err);
        res.status(500).send({ type: 'error', message: 'ERR paymant: ' + err });
    }
};

export const getListProjectWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const chatRooms = await chatLists
            .find({
                $and: [{ usersId: { $in: [user.id] } }, { type: 'project' }],
            })
            .sort({ date: -1 });

        var result = [];

        for (let [index, val] of chatRooms.entries()) {
            const project = await Projects.findOne({
                $and: [
                    // @ts-ignore
                    { _id: val.projectId },
                    { status: 'inProgress' },
                ],
            });

            if (!project) {
                continue;
            }

            const mailsAllCount = await mailChats.countDocuments({ chatRoomId: val._id });

            const mailsAllCountNotRead = await mailChats.countDocuments({
                $and: [{ chatRoomId: val._id }, { read: false }],
            });

            const listenerId = val.usersId.filter((el) => el != user.id);

            const listenerData = await Users.findOne({ _id: listenerId[0] });

            const lastMail = await mailChats.find({ chatRoomId: val._id }).sort({ createdAt: -1 }).limit(1);

            if (listenerData != null && lastMail.length > 0) {
                result.push({
                    id: val._id,
                    img: listenerData.photo,
                    name: listenerData.name[0].val,
                    date:
                        lastMail[0].date.getFullYear() +
                        '-' +
                        (lastMail[0].date.getMonth() < 10
                            ? '0' + (lastMail[0].date.getMonth() + 1)
                            : lastMail[0].date.getMonth() + 1) +
                        '-' +
                        (lastMail[0].date.getDay() + 1),
                    time: lastMail[0].date.getHours() + ':' + lastMail[0].date.getMinutes(),
                    desc: lastMail[0].text,
                    count: mailsAllCount,
                    read: mailsAllCountNotRead > 0 ? false : true,
                    type: val.type,
                    projectId: val.projectId ? val.projectId : '',
                    projectData: project,
                });
            } else if (listenerData != null && lastMail.length == 0) {
                result.push({
                    id: val._id,
                    img: listenerData.photo,
                    name: listenerData.name[0].val,
                    date: '',
                    time: '',
                    desc: '',
                    count: 0,
                    read: 0,
                    type: val.type,
                    projectId: val.projectId ? val.projectId : '',
                    projectData: project,
                });
            }
        }
        return res.status(200).send({ type: 'success', result });
    } catch (err) {
        logger.error('ERR getListProjectWorkspaces: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const chatRoom = await chatLists.findOne({
            $and: [{ _id: data.workspaceId }, { type: 'project' }],
        });

        const projectData = await Projects.findOne({ _id: chatRoom?.projectId });

        const rate = await Rate.findOne({
            $and: [{ projectId: projectData?._id }, { status: 'selected' }],
        });

        const freelancerData = await Users.findOne({ _id: rate?.freelancerId });

        const customerData = await Users.findOne({ _id: chatRoom?.creatorId });

        if (
            freelancerData &&
            projectData &&
            rate &&
            customerData &&
            (user.id == customerData._id || user.id == freelancerData._id)
        ) {
            return res.status(200).send({
                type: 'success',
                result: {
                    projectData,
                    rate,
                    freelancer: {
                        id: freelancerData._id,
                        name: freelancerData.name,
                        img: freelancerData.photo,
                    },
                    customer: {
                        id: customerData._id,
                        name: customerData.name,
                        img: customerData.photo,
                    },
                },
            });
        } else {
            return res.status(500).send({ type: 'error', message: 'err get worckspace data' });
        }
    } catch (err) {
        logger.error('ERR getWorkspace: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const completeProjectAndAddReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const newReview = new Reviews({
            createrId: data.customerId,
            nameUserCreater: data.customerName,
            photoUserCreater: data.customerImg,
            userId: data.freelancerId,
            type: 'positive',
            userType: 'freelance',
            text: data.textReview,
            projectId: data.idProject,
            categoryProjectId: data.categoryId,
            evaluation: data.rating,
            date: getDateTime(),
            isDelete: false,
        });

        await newReview.save().catch((err) => {
            logger.error(err);
            return res.status(500).send({ type: 'error', message: err });
        });

        const updateProject = await Projects.findOneAndUpdate(
            { _id: data.idProject },
            { $set: { status: 'complete' } },
        );

        return res.status(200).send({ type: 'success', chatRoom: newReview });
    } catch (err) {
        logger.error('ERR getWorkspace: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getListSuccessProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;

        let project;

        if (user.role == 'customer') {
            project = await Projects.find({
                $and: [{ idСustomer: user.id }, { status: 'complete' }],
            }).sort({ date: -1 });
        } else if (user.role == 'freelancer') {
            const listSelectedRate = await Rate.find({
                $and: [{ freelancerId: user.id }, { status: 'selected' }],
            });

            if (listSelectedRate) {
                const listProjectsId = listSelectedRate.map((val) => val.projectId);

                project = await Projects.find({
                    $and: [{ _id: listProjectsId }, { status: 'complete' }],
                }).sort({ date: -1 });
            } else {
                project = undefined;
            }
        }

        if (!project) {
            return res.status(500).send({ type: 'error', message: 'not find success project' });
        }

        const chatRoom = await chatLists.findOne({
            $and: [{ usersId: { $in: [user.id] } }, { type: 'project' }],
        });

        var result = [];

        for (let [index, val] of project.entries()) {
            const chatRoom = await chatLists.findOne({
                $and: [{ projectId: val._id }, { type: 'project' }],
            });

            // console.log('chatRoom: ', chatRoom)

            const rate = await Rate.findOne({ projectId: val._id });

            // console.log('rate: ', rate)

            const review = await Reviews.findOne({ projectId: val._id });

            // console.log('review: ', review)

            const freelancer = await Users.findOne({ _id: rate?.freelancerId });

            //console.log('freelancer: ', freelancer)

            if (freelancer) {
                result.push({
                    project: val,
                    chatRoom,
                    review,
                    rate,
                    freelancer: {
                        name: freelancer.name,
                        id: freelancer._id,
                        img: freelancer.photo,
                    },
                });
            } else {
                //return res.status(500).send({type: 'error', message: 'not find freelancer'})
            }
        }

        return res.status(200).send({ type: 'success', result });
    } catch (err) {
        logger.error('ERR getListProjectWorkspaces: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const projectDislike = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const addDislikeOnProject = await Projects.findOneAndUpdate(
            { _id: data.projectId },
            { $push: { dislikeUsers: data.userId } },
        );

        return res.status(200).send({ type: 'success', message: `project ${data.projectId} add to dislike list` });
    } catch (err) {
        logger.error('ERR projectDislike: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getReviewsList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const reviewsList = await Reviews.find({ userId: user.id }).sort({ date: -1 });

        let result = [];

        for (let [index, val] of reviewsList.entries()) {
            const project = await Projects.findOne({ _id: val.projectId });

            result.push({
                project,
                review: val,
            });
        }

        return res.status(200).send({ type: 'success', result });
    } catch (err) {
        logger.error('ERR projectDislike: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};
