export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    name: DataTypes.STRING,
  });

  return Notification;
};
