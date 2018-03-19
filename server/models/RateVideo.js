export default (sequelize, DataTypes) => {
  const RateVideo = sequelize.define('RateVideo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isLiked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    // videoId: {
    //   type: DataTypes.INTEGER,
    // },
  });

  return RateVideo;
};
