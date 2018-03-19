import { Router } from 'express';
import multer from 'multer';

import checkAuth from './lib/auth/checkAuth';

// Import Controllers
import userController from './controllers/userController';
import videoController from './controllers/videoController';
import rateController from './controllers/rateController';
import commentController from './controllers/commentController';
import videoUploadController from './controllers/videoUploadController';
import channelController from './controllers/channelController';
import categoryController from './controllers/categoryController';
import subscriptionController from './controllers/subscriptionController';
import imageController from './controllers/imageController';
import searchController from './controllers/searchController';

const routes = Router();

// User routes
routes.get('/login', userController.login);
routes.get('/sign-up', userController.signUp);
routes.post('/api/sign-up', userController.createUser);
routes.post('/logout', userController.logout);
routes.get('/api/account/username', userController.getUsername);
routes.get('/api/account/user-info', checkAuth, userController.getUserInfo);
routes.patch('/api/account/user-info', checkAuth, userController.editUserInfo);
routes.patch('/api/account/password', checkAuth, userController.editPassword);
routes.get('/forgot', userController.forgot);
routes.post('/forgot', userController.sendPasswordChange);
routes.get('/reset/:token', userController.reset);
routes.post('/reset/:token', userController.changePassword);
routes.get('/api/user-uploading', userController.checkUploading);

routes.get('/applyStatus', checkAuth, userController.apply);
routes.post('/applyStatus', checkAuth, userController.submitApplication);

// Video routes
routes.post('/api/video', checkAuth, videoController.createVideo);
routes.get('/api/video/:videoId', videoController.getVideo);
routes.get('/api/edit/video/:videoId', checkAuth, videoController.getEditVideo);
routes.get('/api/my-videos', checkAuth, videoController.getMyVideos);
routes.get('/api/tags', videoController.getTags);
routes.patch('/api/video', checkAuth, videoController.updateVideo);
routes.get('/api/recommend/:categoryId', videoController.recommendedVideos);
routes.get('/api/featured-video', videoController.getFeatured);
routes.get('/api/recent-channel-videos/:channelId', videoController.getFeaturedChannelVideos);
routes.get('/api/channel-videos/:channelId', videoController.getChannelVideos);
routes.get('/api/featured-home', videoController.getFeaturedChannelsAndVideos);

// Rate routes
routes.get('/api/video/:videoId/like', rateController.getRates);
routes.post('/api/video/:videoId/like', checkAuth, rateController.rateVideo);
routes.delete('/api/video/:videoId/like', checkAuth, rateController.destroyRate);

// Comment routes
routes.get('/api/video/:videoId/comment', commentController.getComments);
routes.get('/api/video/:videoId/comment/:parentCommentId', commentController.getSubComments);
routes.post('/api/video/:videoId/comment', checkAuth, commentController.createComment);
routes.put('/api/video/:videoId/comment', checkAuth, commentController.editComment);
routes.delete('/api/video/:videoId/comment', checkAuth, commentController.deleteComment);

// Video upload
routes.get('/api/video-info/:id', videoUploadController.getVideoInfo);
routes.post('/api/video-upload', checkAuth, videoUploadController.upload);
routes.delete('/api/video-delete/:folderName/:videoId', checkAuth, videoUploadController.delete);

// Image routes
routes.post('/api/image-upload', checkAuth, multer({}).single('image'), imageController.upload);

// Channel routes
routes.get('/api/channel/:channelURL', channelController.getChannel);
routes.get('/api/my-channel', checkAuth, channelController.myChannel);
routes.post('/api/channel', checkAuth, channelController.createChannel);
routes.post('/api/edit-channel', checkAuth, channelController.updateChannel);
routes.get('/api/featured-channels', channelController.getAllFeatured);

// Category routes
routes.get('/api/categories', categoryController.get);
routes.get('/api/channel-categories/:channelId', categoryController.getCurrent);
routes.post('/api/categories', checkAuth, categoryController.update);

// Subscription routes
routes.get('/api/subscription/:channelId', subscriptionController.getSubscription);
routes.get('/api/subscription', checkAuth, subscriptionController.getAllSubscription);
routes.post('/api/subscription', checkAuth, subscriptionController.newSubscription);
routes.delete('/api/subscription', checkAuth, subscriptionController.deleteSubscription);

routes.get('/api/search', searchController.search);

export default routes;
