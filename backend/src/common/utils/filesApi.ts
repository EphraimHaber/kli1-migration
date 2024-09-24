import { Files } from '@/api/files/filesModel';
import { mailChats } from '@/api/mailChat/mailChatModel';
import GridFS, { Grid } from 'gridfs-stream';
import { mongo } from 'mongoose';
// import * as mongo from 'mongodb';
import { Server, Socket } from 'socket.io';
import { logger } from './logger';
import { getDateTime, getTime } from './dateUtils';
import { sendMessage } from './socket-functions';
import { MongoClient } from 'mongodb';
import { env } from './envConfig';

let gfs: Grid;
const { MONGODB_URI, DB_NAME } = env;
const mongoClient = new MongoClient(MONGODB_URI);
mongoClient
    .connect()
    .then((client) => {
        gfs = GridFS(client.db(DB_NAME), mongo);
    })
    .catch((err) => {
        logger.error(err);
    });

export const fileUploader = async (io: any, stream: any, data: any, socket: any, user: any) => {
    try {
        console.log('start saving file...');
        console.log('data.name: ', data);
        console.log('user: ', user);

        /**
         *     export interface Options {
        _id?: string | undefined;
        filename?: string | undefined;
        mode?: string | undefined;

        range?: Range | undefined;

        // any other options from the GridStore may be passed too, e.g.
        chunkSize?: number | undefined;
        content_type?: string | undefined;
        root?: string | undefined;
        metadata?: any;
    }
         */
        const objectId = new mongo.ObjectId().toString();
        const writeStream = gfs.createWriteStream({
            _id: objectId,
            filename: `${data.name}`,
            chunkSize: 1024,
        });

        stream.pipe(writeStream);
        writeStream.on('close', async function (file: any) {
            console.log(file);
            const infoFile = new Files({
                url: `/files/${user.userId}/${objectId}/${data.name}`,
                userId: user.userId,
                fileId: file._id,
            });

            await infoFile.save().catch((err) => {
                logger.error(err.toString());
                io.emit('error', { message: err });
                return { type: 'error' };
            });

            const mailsRoom = await mailChats.countDocuments({ chatRoomId: data.chatRoomId });

            const newMail = new mailChats({
                senderId: user.userId,
                chatRoomId: user.chatRoomId,
                listenerId: user.listenerId,
                nameUserSender: user.userName,
                photoUserSender: user.userPhoto,
                typeMail: 'personal',
                text: infoFile.url,
                serialNumber: mailsRoom + 1,
                read: false,
                date: getDateTime(),
                time: getTime(),
            });
            await newMail.save().catch((err) => {
                logger.error('ERR save newMail(file url): ' + err);
                return { type: 'error' };
            });

            sendMessage(data.listenerId, data.userId, infoFile.url, data.chatRoomId);
            console.log('success upload file');

            io.emit('file', { filename: `${infoFile.url}`, file: file });
            return { type: 'success' };
        });
    } catch (err) {
        console.log('ERR save files: ', err);
        return { type: 'error' };
    }
};

export const ReadFile = async (fileName: string, res: any) => {
    try {
        const fileInfo = await Files.find({ url: fileName });
        if (fileInfo != undefined && fileInfo.length > 0) {
            gfs.files.find({ _id: fileInfo[fileInfo.length - 1].fileId }).toArray(function (err: any, files: any) {
                if (err) {
                    console.log('err find file: ', err);
                    return res.status(500).send({ error: err });
                }
            });

            var readstream = gfs.createReadStream({
                _id: `${fileInfo[fileInfo.length - 1].fileId}`,
            });

            readstream.on('error', function (err: any) {
                console.log('error ReadFile: ', err);
                return res.status(500).send({ error: err });
            });

            readstream.pipe(res);
        } else return res.status(500).send({ error: 'file not found' });
    } catch (err) {
        console.log('err ReadFile: ', err);
        return { error: 'err ReadFile' };
    }
};
