export default (sequelize, DataTypes) => {
  const ChannelCategory = sequelize.define('ChannelCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  return ChannelCategory;
};
