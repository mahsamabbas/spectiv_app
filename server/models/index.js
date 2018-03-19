import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';

// Define Sequelize Connnection
const {
  POSTGRES_DATABASE,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env;

let sequelize;

if (process.env.NODE_ENV !== 'test') {
  // sequelize = new Sequelize(`postgres://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}`, {
  //   logging: false,
  // });
  sequelize = new Sequelize(POSTGRES_DATABASE, POSTGRES_USERNAME, POSTGRES_PASSWORD, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    dialect: 'postgres'
  });
} else {
  sequelize = new Sequelize('spectiv-test', 'Jin', '', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  });
}

const db = {};
// Model Import
fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

// Relationships Start
db.Channel.hasMany(db.Video, { foreignKey: 'channelId' });
db.Video.belongsTo(db.Channel, { foreignKey: 'channelId' });

db.User.hasMany(db.Comment, { foreignKey: 'userId' });
db.Video.hasMany(db.Comment, { foreignKey: 'videoId' });
db.Comment.belongsTo(db.User, { foreignKey: 'userId' });
db.Comment.belongsTo(db.Video, { foreignKey: 'videoId' });
db.Comment.hasMany(db.Comment, { as: 'ParentComment', foreignKey: 'parentCommentId' });
db.Comment.belongsTo(db.Comment, { as: 'ReplyComment', foreignKey: 'replyCommentId' });

db.User.belongsToMany(db.Role, { through: db.UserRole, foreignKey: 'videoId' });
db.Role.belongsToMany(db.User, { through: db.UserRole, foreignKey: 'userId' });

db.Video.belongsToMany(db.Tag, { through: db.VideoTag, foreignKey: 'videoId' });
db.Tag.belongsToMany(db.Video, { through: db.VideoTag, foreignKey: 'tagId' });
db.Tag.belongsTo(db.User, { foreignKey: 'userId' });

db.Channel.belongsToMany(db.Category, { through: db.ChannelCategory, foreignKey: 'channelId' });
db.Category.belongsToMany(db.Channel, { through: db.ChannelCategory, foreignKey: 'categoryId' });

db.User.hasOne(db.Livestream, { foreignKey: 'userId' });
db.Livestream.belongsTo(db.User, { foreignKey: 'livestreamId' });

db.User.belongsToMany(db.Notification, { through: 'UserNotification', foreignKey: 'userId' });
db.Notification.belongsToMany(db.User, { through: 'UserNotification', foreignKey: 'notificationId' });

db.User.hasOne(db.Channel, { foreignKey: 'userId' });
db.Channel.belongsTo(db.User, { foreignKey: 'userId' });

db.RateVideo.belongsTo(db.User, { through: 'RateVideo', foreignKey: 'userId' });
db.RateVideo.belongsTo(db.Video, { through: 'RateVideo', foreignKey: 'videoId' });
db.User.hasMany(db.RateVideo, { foreignKey: 'userId' });
db.Video.hasMany(db.RateVideo, { foreignKey: 'videoId' });

db.UserSubscription.belongsTo(db.User, { through: 'UserSubscription', foreignKey: 'userId' });
db.UserSubscription.belongsTo(db.Channel, { through: 'UserSubscription', foreignKey: 'channelId' });
db.Channel.hasMany(db.UserSubscription, { foreignKey: 'channelId' });
db.User.hasMany(db.UserSubscription, { foreignKey: 'userId' });

db.User.hasOne(db.Questionnaire, { foreignKey: 'userId' });
db.Questionnaire.belongsTo(db.User, { foreignKey: 'userId' });
// Relationships End (Love isn't real.)

// Export
export default Object.assign({}, {
  sequelize,
  Sequelize,
}, db);
