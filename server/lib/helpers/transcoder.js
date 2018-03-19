import AWS from 'aws-sdk';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: '401028',
  key: '484bec97617b22d89c5b',
  secret: 'f62ffaf346ecc53f3591',
  cluster: 'us2',
  encrypted: true,
});

const elastictranscoder = new AWS.ElasticTranscoder({ apiVersion: '2012-09-25', region: 'us-west-1' });

const transcoder = (Key, videoName, suffix, id, videoHeight, videoId) => {
  const params = {
    Input: {
      Key: `${Key}/${videoName}.${suffix}`,
    },
    PipelineId: process.env.AWS_PIPELINE,
    OutputKeyPrefix: `${Key}/`,
    Outputs: [
      {
        Key: `output/${videoName}`,
        ThumbnailPattern: `temp-thumbnails/${videoName}-{count}`,
        PresetId: '1508108376228-bg20yr',
        SegmentDuration: '10',
      },
    ],
    Playlists: [
      {
        Format: 'HLSv3',
        Name: `${videoName}-master`,
        OutputKeys: [`output/${videoName}`],
      },
    ],
  };

  return new Promise((resolve, reject) => {
    if (videoHeight > 2000) {
      params.Outputs.push(
        {
          Key: `${videoName}-1440p`,
          PresetId: '1507402604067-de36gt',
        },
      );
    }
    elastictranscoder.createJob(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('TRANSCODER STARTED!!!!! : ', data);
        pusher.trigger('videos', `encode-progress-${id}`, videoId);

        elastictranscoder.waitFor('jobComplete', { Id: data.Job.Id }, (err2, data2) => {
          if (err2) {
            console.log('TRANSCODER CRASHED!!!!! : ', err2);
            elastictranscoder.readJob({ Id: data.Job.Id }, (err3, data3) => {
              console.log('ERROR2 ######', err3);
              console.log('DATA2 #####', data3);
            });
            reject(err2);
          } else {
            console.log('TRANSCODER COMPLETE!!!!! : ', data2);
            resolve(data2.Job);
          }
        });
      }
    });
  });
};

export default transcoder;
