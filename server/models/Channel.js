export default (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    channelURL: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    desc: DataTypes.STRING(600),
    businessEmail: DataTypes.STRING,
    isFeatured: DataTypes.BOOLEAN,
    color: DataTypes.STRING,
    searchId: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  return Channel;
};
