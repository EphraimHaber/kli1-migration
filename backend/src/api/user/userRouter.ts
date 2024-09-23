import express from 'express';
import multer from 'multer';
import { fetchUserFromToken, isAuthenticated } from '@/common/middleware/passport';
import {
    getUserPersonalFreelancerPages,
    getUserPersonalCustomerPages,
    postUserData,
    postAllUserData,
    updateUserData,
    uploadImageUser,
    deleteImageUser,
    deleteAccount,
    getUsersSetting,
    addPortfolio,
    getCountryOrCity,
    getCustomerUser,
    getFreelanceResume,
    getFreelancers,
    getFreelancerUser,
    getPortfolio,
    removePortfolio,
    updateFreelanceResume,
    updatePortfolio,
    uploadImagePortfolio,
} from './userController';
import { multerUpload } from '@/common/utils/cloudinaryApi';

export const userRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/temp/image');
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });

userRouter.use(fetchUserFromToken);

userRouter.get(
    ['/personal-freelancer', '/personal-freelancer/:subcategory'],
    isAuthenticated,
    getUserPersonalFreelancerPages,
);
userRouter.get(
    ['/personal-customer', '/personal-customer/:subcategory'],
    isAuthenticated,
    getUserPersonalCustomerPages,
);
userRouter.post('/getData', isAuthenticated, postUserData);
userRouter.post('/getAllData', isAuthenticated, postAllUserData);
userRouter.post('/updateData', isAuthenticated, updateUserData);
userRouter.post('/updatePhoto', isAuthenticated, multerUpload.single('userIcon'), uploadImageUser);
userRouter.post('/deletePhoto', isAuthenticated, deleteImageUser);
userRouter.post('/deleteAccount', isAuthenticated, deleteAccount);
userRouter.post('/getUsersSettings', isAuthenticated, getUsersSetting);

//router.post("/customer/getNotifications",
//  isAuthenticated, userController.getNotificationCustomer);
userRouter.post('/customer/:id', getCustomerUser);

userRouter
    .route('/freelancer/resume')
    .get(isAuthenticated, getFreelanceResume)
    .post(isAuthenticated, updateFreelanceResume);
userRouter.route('/freelancer/add-portfolio').post(isAuthenticated, addPortfolio);
userRouter.route('/freelancer/portfolio/delete/:id').delete(isAuthenticated, removePortfolio);
userRouter.route('/freelancer/portfolio/update').post(isAuthenticated, updatePortfolio);
userRouter
    .route('/freelancer/portfolio/uploadImage')
    .post(isAuthenticated, multerUpload.single('userIcon'), uploadImagePortfolio);
userRouter.route('/freelancer/get-portfolio/:id').get(getPortfolio).post(getPortfolio);
userRouter.post('/freelancer/:id', getFreelancerUser);
userRouter.post('/getCountryOrCities', getCountryOrCity);
userRouter.post('/getFreelancers', getFreelancers);
