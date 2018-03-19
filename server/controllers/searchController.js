import * as clients from './../config/algolia';

const searchController = {};

searchController.search = (req, res) => {
  const { query, filter, page } = req.query;
  const { client } = clients;

  let queries;

  if (filter === 'most') {
    queries = [{
      indexName: 'videoIndex_by_most_views_desc',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }, {
      indexName: 'channelIndex_by_most_subscribers_desc',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }];
  } else if (filter === 'recent') {
    queries = [{
      indexName: 'videoIndex_by_recent_desc',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }, {
      indexName: 'channelIndex_by_recent_desc',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }];
  } else if (filter === 'popularity') {
    queries = [{
      indexName: 'videoIndex_by_recent_desc',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }, {
      indexName: 'channelIndex_by_recent_desc',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }];
  } else if (filter === 'relevance') {
    queries = [{
      indexName: 'video_index',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }, {
      indexName: 'channel_index',
      query,
      params: {
        hitsPerPage: 10,
        page,
      },
    }];
  }

  const searchCallback = (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        err,
      });
    }

    return res.status(200).json({
      content,
      success: true,
    });
  };

  if (process.env.NODE_ENV === 'production') {
    return client.search(queries, searchCallback);
  }
  return searchCallback(null, []);
};

export default searchController;
