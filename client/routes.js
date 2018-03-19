import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/core/Layout.jsx';
import NotFound from './components/general/NotFound.jsx';
import Home from './components/home/Home.jsx';
import ApplyPage from './components/applyPage/Apply.jsx';
import Approved from './components/applyPage/Approved.jsx';
import VideoPage from './components/videoPage/VideoPage.jsx';
import Upload from './components/upload/Upload.jsx';
import EditVideo from './components/editVideo/EditVideo.jsx';
import VideoManager from './components/videoManager/VideoManager.jsx';
import Channel from './components/channel/Channel.jsx';
import MyChannel from './components/channel/MyChannel.jsx';
import EditChannel from './components/channel/EditChannel.jsx';
import Subscription from './components/subscription/Subscription.jsx';
import Setting from './components/setting/Setting.jsx';
import Results from './components/search/Results.jsx';
import ErrorHandle from './components/alertHandle/index.jsx';
import AlphaInfo from './components/alphaInfo/AlphaInfo.jsx';

const rootRoute = (
  <Route path="/" component={Layout}>
    <IndexRoute component={Home} />
    <Route path="apply" component={ApplyPage} />
    <Route path="v/:videoId" component={VideoPage} />
    <Route path="edit/:videoId" component={EditVideo} />
    <Route path="approved" component={Approved} />
    <Route path="upload" component={Upload} />
    <Route path="video-manager" component={VideoManager} />
    <Route path="my-channel" component={MyChannel} />
    <Route path="my-channel/edit" component={EditChannel} />
    <Route path="channel/:channelURL" component={Channel} />
    <Route path="subscriptions" component={Subscription} />
    <Route path="results" component={Results} />
    <Route path="settings" component={Setting} />
    <Route path="alpha-info" component={AlphaInfo} />
    <Route path="error-handle" component={ErrorHandle} />
    <Route path="*" component={NotFound} />
  </Route>
);

export default rootRoute;
