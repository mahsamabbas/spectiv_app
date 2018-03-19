export default (sequelize, DataTypes) => {
  const Questionnaire = sequelize.define('Questionnaire', {
    technology: DataTypes.STRING,
    yesNo: DataTypes.STRING,
    explain: DataTypes.STRING,
  });

  return Questionnaire;
};
