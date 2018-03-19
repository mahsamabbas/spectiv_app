export default (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    filename: DataTypes.STRING,
    title: DataTypes.STRING(100),
    thumbnailPath: DataTypes.STRING,
    desc: DataTypes.STRING(600),
    accessibility: DataTypes.INTEGER, // 1 = Public, 2 = Unlisted, 3 = Private
    canLike: DataTypes.BOOLEAN,
    canComment: DataTypes.BOOLEAN,
    pathToOriginal: DataTypes.STRING,
    pathTo1440p: DataTypes.STRING,
    pathTo1080p: DataTypes.STRING,
    isFeatured: DataTypes.BOOLEAN,
    isStaffPick: DataTypes.BOOLEAN,
    isVideoOfTheDay: DataTypes.BOOLEAN,
    isViewerPick: DataTypes.BOOLEAN,
    duration: DataTypes.INTEGER,
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isDeleted: DataTypes.BOOLEAN,
    searchId: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  return Video;
};
