import { Server as SocketIOServer, Socket } from 'socket.io';
// import { Users } from './models/User'; // Adjust the import path accordingly
import fs from 'fs';
import path from 'path';
import { Users } from '@/api/user/userModel';
import { logger } from './logger';

interface CustomSocket extends Socket {
    // Add custom properties if needed
}

interface SetSocketIdData {
    userId: string;
    socketId: string;
}

interface SendMessageData {
    id: string;
    senderId: string;
    message: string;
}

interface UploadFileData {
    fileBuffer: Buffer;
    fileName: string;
}

let copySocket: CustomSocket;

export const socketFunctions = (io: SocketIOServer): void => {
    io.on('connection', (socket: CustomSocket) => {
        copySocket = socket;
        console.log('Client connected:', socket.id);

        socket.on('tests', (data: any) => {
            console.log('Received "tests" event:', data);
        });

        socket.on('setSocketIdForUser', async (data: SetSocketIdData) => {
            try {
                const result = await Users.findOneAndUpdate({ _id: data.userId }, { userData: data.socketId });
                console.log('User socket ID updated:', result != null);
            } catch (error) {
                console.error('Error updating user socket ID:', error);
            }
        });

        socket.on('sendMessageToUser', async (data: SendMessageData) => {
            console.log('Sending message to user:', data);
            // Implement your message sending logic here
        });

        socket.on('uploadFile', async (data: UploadFileData) => {
            try {
                logger.info('uploading file. TODO');
                // const filePath = path.join(__dirname, 'uploads', data.fileName);
                // fs.writeFile(filePath, data.fileBuffer, (err) => {
                //     if (err) {
                //         console.error('Error saving file:', err);
                //         socket.emit('uploadError', { message: 'File upload failed' });
                //     } else {
                //         console.log('File saved successfully:', data.fileName);
                //         socket.emit('uploadSuccess', { message: 'File uploaded successfully' });
                //     }
                // });
            } catch (error) {
                console.error('Error handling file upload:', error);
            }
        });
    });
};

export const sendMessage = async (userId: string, senderId: string, message: string, chatRoomId: string) => {
    try {
        const user = await Users.findOne({ _id: userId });

        if (user != null) {
            console.log('user.userData: ', user.userData);
            copySocket.to(user.userData).emit('newMessage', {
                message: message,
                chatRoomId: chatRoomId,
            });
        } else {
            console.log('err sendMessage: user not found');
        }
    } catch (err) {
        console.log('err sendMessage: ', err);
    }
};
