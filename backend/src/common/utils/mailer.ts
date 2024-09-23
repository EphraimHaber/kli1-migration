import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
    // host: ''+ process.env.EMAIL_HOST,
    // port: 465,
    // secure: true,
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendMailTest = (data: any) => {
    // console.log(data);
    const mailOptions = {
        to: data.mailAdress,
        from: process.env.EMAIL,
        subject: data.subject,
        html: data.message,
    };
    transporter.sendMail(mailOptions, (err) => {
        logger.error('ERR send mail: ' + err);
        return false;
    });
    return true;
};

export const sendMail = async (mailAddress: string, subject: string, message: string): Promise<boolean> => {
    // console.log('send mail user ', +mailAddress);
    // console.log('subject ', +subject);
    // console.log('message ', +message);
    const mailOptions = {
        to: mailAddress,
        from: process.env.EMAIL,
        subject: subject,
        html: message,
    };
    transporter.sendMail(mailOptions, (err) => {
        logger.error('ERR send mail: ' + err);
        return false;
    });
    return true;
};
