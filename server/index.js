import app from './app';
import db from './models';
import seedDB from './config/seed';

const { PORT = 1337 } = process.env;

db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Running on port ${PORT}...`));
  // seedDB(db);
}).catch((err) => {
  console.log(err);
});
