import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import mongoose, { Schema, Document } from 'mongoose';
import passport from 'passport';
import { IUser } from '../user/types';
import { chatLists } from './chatListsModel';
import { getDateTime, getTime } from '@/common/utils/dateUtils';
import { logger } from '@/common/utils/logger';
import { mailChats } from '../mailChat/mailChatModel';
import { sendMessage } from '@/common/utils/socket-functions';
import { ReadFile } from '@/common/utils/filesApi';
import { Users } from '../user/userModel';

export const getChatRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const chatRoom = await chatLists.findOne({
            $and: [{ usersId: { $all: [user.id, data.userId] } }, { type: data.type }],
        });
        if (chatRoom) {
            return res.status(200).send({ type: 'success', chatRoom });
        }
        const newChatList = new chatLists({
            creatorId: user.id,
            usersId: [user.id, data.userId],
            status: 'active',
            type: data.type ? data.type : 'personal',
            date: getDateTime(),
        });
        await newChatList.save().catch((err) => {
            logger.error(err);
            return res.status(500).send({ type: 'error', message: err });
        });
        return res.status(200).send({ type: 'success', chatRoom: newChatList });
    } catch (err) {
        logger.error('ERR getChatRoom: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getListChatRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;

        const chatRooms = await chatLists
            .find({ $and: [{ usersId: { $in: [user.id] } }, { $or: [{ type: 'personal' }, { type: 'comment' }] }] })
            .sort({ date: -1 });

        // console.log('chatRooms: ', chatRooms)

        var result = [];

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
                    type: val.type,
                    projectId: val.projectId ? val.projectId : '',
                });
            }
        }

        return res.status(200).send({ type: 'success', result });
    } catch (err) {
        logger.error('ERR getChatRoom: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getChatMails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        const mailsRoom = await mailChats.find({ chatRoomId: data.chatRoomId });
        const chatRoom = await chatLists.findOne({ _id: data.chatRoomId });
        const listenerData = await Users.findOne({
            _id: chatRoom?.usersId.filter((el) => el != user.id.toString())[0],
        });

        if (mailsRoom.length > 0) {
            return res.status(200).send({
                type: 'success',
                data: {
                    mails: mailsRoom,
                    listener: chatRoom != null ? chatRoom.usersId.filter((el) => el != user.id.toString()) : '',
                    name: listenerData != null ? listenerData.name[0].val : '',
                },
            });
        } else {
            return res.status(200).send({
                type: 'success',
                data: {
                    mails: [],
                    listener: chatRoom != null ? chatRoom.usersId.filter((el) => el != user.id.toString()) : '',
                    name: listenerData != null ? listenerData.name[0].val : '',
                },
            });
        }
    } catch (err) {
        logger.error('ERR getChatMails: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const addChatMails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.context.user as IUser;
        const data = req.body;

        let mailsRoom = await mailChats.countDocuments({ chatRoomId: data.chatRoomId });

        const newMail = new mailChats({
            senderId: user.id,
            chatRoomId: data.chatRoomId,
            listenerId: [data.listenerId],
            nameUserSender: user.name[0].val,
            photoUserSender: user.photo ? user.photo : '/image/profile-photo.jpg',
            typeMail: 'personal',
            text: data.text,
            serialNumber: ++mailsRoom,
            read: false,
            date: getDateTime(),
            time: getTime(data.timeZone ? data.timeZone : undefined),
        });
        await newMail.save().catch((err) => {
            logger.error('ERR save newMail: ' + err);
            return res.status(500).send({ type: 'error', message: err });
        });
        sendMessage(data.listenerId, user.id, data.text, data.chatRoomId);

        return res.status(200).send({ type: 'success', mails: newMail });
    } catch (err) {
        logger.error('ERR getChatMails: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.params;

        ReadFile(`/files/${params.id}/${params.id2}/${params.name}`, res);
    } catch (err) {
        logger.error('ERR getFile: ' + err);
        return res.status(500).send({ type: 'error', message: err });
    }
};
