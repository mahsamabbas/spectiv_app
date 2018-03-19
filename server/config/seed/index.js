import seedUsers from './seedUsers';
import seedRoles from './seedRoles';
import seedVideos from './seedVideos';
import seedChannels from './seedChannels';
import seedCategories from './seedCategories';

// const seedData = (db) => {
//   setTimeout(() => {
//     seedUsers(db);
//     setTimeout(() => {
//       seedRoles(db);
//       setTimeout(() => {
//         seedChannels(db);
//         setTimeout(() => {
//           seedVideos(db);
//         }, 1000);
//       }, 1000);
//     }, 1000);
//   }, 1000);
// };
const seedData = (db) => {
  seedCategories(db);
}

export default seedData;
