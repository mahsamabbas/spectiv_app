import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const videoIndex = client.initIndex('video_index');
const videoMostViews = client.initIndex('videoIndex_by_most_views_desc');
const videoRecent = client.initIndex('videoIndex_by_recent_desc');
const videoPopular = client.initIndex('videoIndex_by_popularity_desc');
const channelIndex = client.initIndex('channel_index');
const channelMostSubs = client.initIndex('channelIndex_by_most_subscribers_desc');
const channelRecent = client.initIndex('channelIndex_by_recent_desc');

channelIndex.setSettings({
  replicas: [
    'channelIndex_by_recent_desc',
    'channelIndex_by_most_subscribers_desc',
  ],
  searchableAttributes: [
    'name',
    'desc',
  ],
  ranking: [
    'desc(name)',
    'desc(desc)',
    'desc(subscribers)',
    'desc(createdAt)',
  ],
});

videoIndex.setSettings({
  replicas: [
    'videoIndex_by_recent_desc',
    'videoIndex_by_most_views_desc',
    'videoIndex_by_popularity_desc',
  ],
  searchableAttributes: [
    'title',
    'desc',
  ],
  ranking: [
    'desc(title)',
    'desc(desc)',
    'desc(views)',
    'desc(createdAt)',
  ],
});

channelMostSubs.setSettings({
  searchableAttributes: [
    'name',
    'desc',
  ],
  ranking: [
    'desc(subscribers)',
    'desc(createdAt)',
    'desc(name)',
    'desc(desc)',
  ],
});

channelRecent.setSettings({
  searchableAttributes: [
    'name',
    'desc',
  ],
  ranking: [
    'desc(createdAt)',
    'desc(subscribers)',
    'desc(name)',
    'desc(desc)',
  ],
});

videoMostViews.setSettings({
  searchableAttributes: [
    'title',
    'desc',
  ],
  ranking: [
    'desc(views)',
    'desc(likes)',
    'desc(createdAt)',
    'desc(title)',
    'desc(desc)',
  ],
});

videoPopular.setSettings({
  searchableAttributes: [
    'title',
    'desc',
  ],
  ranking: [
    'desc(likes)',
    'desc(views)',
    'desc(createdAt)',
    'desc(title)',
    'desc(desc)',
  ],
});

videoRecent.setSettings({
  searchableAttributes: [
    'title',
    'desc',
  ],
  ranking: [
    'desc(createdAt)',
    'desc(views)',
    'desc(likes)',
    'desc(title)',
    'desc(desc)',
  ],
});


module.exports = {
  client,
  channelIndex,
  videoIndex,
  channelMostSubs,
  channelRecent,
  videoMostViews,
  videoPopular,
  videoRecent,
};
