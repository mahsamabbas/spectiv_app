export default (sequelize, DataTypes) => {
  const Livestream = sequelize.define('Livestream', {
    name: DataTypes.STRING,
  });

  return Livestream;
};
