export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    comment: DataTypes.STRING,
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Comment;
};
