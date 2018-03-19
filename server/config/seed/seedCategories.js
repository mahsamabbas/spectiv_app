import async from 'async';

const seedCategories = (db) => {
  const cat1 = (callback) => {
    db.Category.build({
      id: 1,
      name: 'Adventure',
    }).save().then(() => {
      console.log('Category 1 created!');
      callback();
    });
  };

  const cat2 = (callback) => {
    db.Category.build({
      id: 2,
      name: 'Animals',
    }).save().then(() => {
      console.log('Category 2 created!');
      callback();
    });
  };

  const cat3 = (callback) => {
    db.Category.build({
      id: 3,
      name: 'Cityscapes',
    }).save().then(() => {
      console.log('Category 3 created!');
      callback();
    });
  };

  const cat4 = (callback) => {
    db.Category.build({
      id: 4,
      name: 'Comedy',
    }).save().then(() => {
      console.log('Category 4 created!');
      callback();
    });
  };

  const cat5 = (callback) => {
    db.Category.build({
      id: 5,
      name: 'Drone / Aerial',
    }).save().then(() => {
      console.log('Category 5 created!');
      callback();
    });
  };

  const cat6 = (callback) => {
    db.Category.build({
      id: 6,
      name: 'Education',
    }).save().then(() => {
      console.log('Category 6 created!');
      callback();
    });
  };

  const cat7 = (callback) => {
    db.Category.build({
      id: 7,
      name: 'Food',
    }).save().then(() => {
      console.log('Category 7 created!');
      callback();
    });
  };

  const cat8 = (callback) => {
    db.Category.build({
      id: 8,
      name: 'Gaming',
    }).save().then(() => {
      console.log('Category 8 created!');
      callback();
    });
  };

  const cat9 = (callback) => {
    db.Category.build({
      id: 9,
      name: 'Live Events',
    }).save().then(() => {
      console.log('Category 9 created!');
      callback();
    });
  };

  const cat10 = (callback) => {
    db.Category.build({
      id: 10,
      name: 'Live Streaming',
    }).save().then(() => {
      console.log('Category 10 created!');
      callback();
    });
  };

  const cat11 = (callback) => {
    db.Category.build({
      id: 11,
      name: 'Music',
    }).save().then(() => {
      console.log('Category 11 created!');
      callback();
    });
  };

  const cat12 = (callback) => {
    db.Category.build({
      id: 12,
      name: 'Nature / Outdoors',
    }).save().then(() => {
      console.log('Category 12 created!');
      callback();
    });
  };

  const cat13 = (callback) => {
    db.Category.build({
      id: 13,
      name: 'Sports',
    }).save().then(() => {
      console.log('Category 13 created!');
      callback();
    });
  };

  const cat14 = (callback) => {
    db.Category.build({
      id: 14,
      name: 'Tutorials (How-To)',
    }).save().then(() => {
      console.log('Category 14 created!');
      callback();
    });
  };

  const cat15 = (callback) => {
    db.Category.build({
      id: 15,
      name: 'VLOG',
    }).save().then(() => {
      console.log('Category 15 created!');
      callback();
    });
  };

  const cat16 = (callback) => {
    db.Category.build({
      id: 16,
      name: 'Curiosities',
    }).save().then(() => {
      console.log('Category 16 created!');
      callback();
    });
  };


  async.waterfall([
    cat1,
    cat2,
    cat3,
    cat4,
    cat5,
    cat6,
    cat7,
    cat8,
    cat9,
    cat10,
    cat11,
    cat12,
    cat13,
    cat14,
    cat15,
    cat16,
  ], (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default seedCategories;
