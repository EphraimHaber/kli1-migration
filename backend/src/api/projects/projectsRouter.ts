import { fetchUserFromToken, isAuthenticated } from '@/common/middleware/passport';
import express, { Router } from 'express';
import {
    getProjects,
    getOneProject,
    getCustomerProject,
    getProjectInWork,
    getUserById,
    getUsersProject,
    createNewProject,
    removeProject,
    getRateUser,
    getAllRateUser,
    getProjectRates,
    addRateUser,
    updateProjectRates,
    updateProjectRatesStatus,
    deleteProjectRates,
    getComments,
    getCommentsOwnerProject,
    addNewComment,
    removeComment,
    paymant,
    getListProjectWorkspaces,
    getWorkspace,
    completeProjectAndAddReview,
    getListSuccessProjects,
    projectDislike,
    getReviewsList,
} from './projectController';
export const projectsRouter: Router = express.Router();

projectsRouter.use(fetchUserFromToken);
projectsRouter.post('/projects', getProjects);
projectsRouter.post('/project/:id', getOneProject);
projectsRouter.post('/rates/freelancer', getOneProject);
projectsRouter.post('/projects/getCustomerProject', isAuthenticated, getCustomerProject);
projectsRouter.post('/projects/getProjectInWork', isAuthenticated, getProjectInWork);
projectsRouter.post('/projects/getUser/:id', isAuthenticated, getUserById);
projectsRouter.post('/rates/customer', isAuthenticated, getUsersProject);
projectsRouter.post('/projects/createNewProject', isAuthenticated, createNewProject);
projectsRouter.post('/projects/updateProject', isAuthenticated, createNewProject);
projectsRouter.delete('/projects/removeProject', isAuthenticated, removeProject);
projectsRouter.post('/project/rate/:id', getOneProject);

projectsRouter.post('/projects/getRateUser', isAuthenticated, getRateUser);
projectsRouter.post('/projects/getAllRateUser', isAuthenticated, getAllRateUser);
projectsRouter.post('/projects/getProjectRates/:id', getProjectRates);
projectsRouter.post('/projects/addRateUser/:id', isAuthenticated, addRateUser);
projectsRouter.post('/projects/updateRateUser', isAuthenticated, updateProjectRates);
projectsRouter.post('/projects/updateRateStatusUser/:id', isAuthenticated, updateProjectRatesStatus);
projectsRouter.delete('/projects/deleteRateUser/:id', isAuthenticated, deleteProjectRates);

projectsRouter.post('/projects/getComment/:id', isAuthenticated, getComments);
projectsRouter.post('/projects/getCommentsOwnerProject/:id', isAuthenticated, getCommentsOwnerProject);
projectsRouter.post('/projects/addComment', isAuthenticated, addNewComment);
projectsRouter.delete('/projects/deleteComment/:id', isAuthenticated, removeComment);

projectsRouter.post('/projects/paymant', isAuthenticated, paymant);

projectsRouter.post('/projects/getListProjectWorkspaces', isAuthenticated, getListProjectWorkspaces);
projectsRouter.post('/projects/getWorkspace', isAuthenticated, getWorkspace);
projectsRouter.post('/projects/completeProjectAndAddReview', isAuthenticated, completeProjectAndAddReview);
projectsRouter.post('/projects/getListSuccessProjects', isAuthenticated, getListSuccessProjects);
projectsRouter.post('/projects/dislike', isAuthenticated, projectDislike);
projectsRouter.post('/projects/getReviewsList', isAuthenticated, getReviewsList);
