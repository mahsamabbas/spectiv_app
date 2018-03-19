export default (sequelize, DataTypes) => {
  const VideoTag = sequelize.define('VideoTag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  return VideoTag;
};
