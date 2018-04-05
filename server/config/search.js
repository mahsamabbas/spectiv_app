exports.addObjectToChannel = (channelObject) =>{
    return new Promise((resolve, reject) =>{
        if(channelObject){
            console.log(channelObject);
            resolve(channelObject);
        }else{
            reject();
        }
    });
}

exports.partialUpdateChannel = (channelObject) =>{
    return new Promise((resolve, reject) =>{
        if(channelObject){
            console.log(channelObject);
            resolve(channelObject);
        }else{
            reject();
        }
    });
}

exports.getChannelObject = (searchId) =>{
    return new Promise((resolve, reject) =>{
        if(searchId){
            console.log("fetching channel by ID: "+searchId);
            resolve(searchId);
        }else{
            reject();
        }
    })
}

exports.deleteChannel = (channelId) =>{
    return new Promise((resolve, reject) =>{
        if(channelId){
            console.log("Channel is deleted by ID: "+channelId);
            resolve(channelId);
        }else{
            reject();
        }
    })
}
exports.addObjectToVideo = (videoObject) =>{
    return new Promise(function(resolve, reject){
        if(videoObject){
            console.log(videoObject);
            resolve(videoObject);
        }else{
            reject();
        }
    })
}

exports.partialUpdateVideo = (videoObject) =>{
    return new Promise((resolve, reject) =>{
        if(videoObject){
            console.log(videoObject);
            resolve(videoObject);
        }else{
            reject();
        }
    })
    console.log(videoObject);
}

exports.getVideoObject = (searchId) =>{
    return new Promise((resolve, reject) =>{
        if(searchId){
            console.log("fetching video by ID: "+searchId);
            resolve(searchId);
        }else{
            reject();
        }

    })
}
exports.deleteVideo = (videoId) =>{
    return new Promise((resolve, reject) =>{
        if(videoId){
            console.log("Video is deleted by ID: "+videoId);
            resolve();
        }else{
            reject();
        }
    })
}

exports.searchQueries = (queries) =>{
    return new Promise((resolve, reject) =>{
        if(queries){
            console.log(queries);
            resolve(queries)
        }else{
            reject();
        }
    })
}