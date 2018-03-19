import axios from 'axios';

export const submitApply = (technology, yesNo, explain) => {
  return new Promise((resolve, reject) => {
    if (!technology || !yesNo || !explain) {
      reject('You can\'t leave any question blank!');
    } else {
      axios({
        method: 'POST',
        url: '/applyStatus',
        data: {
          technology,
          yesNo,
          explain,
        },
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err.response.data.message);
      });
    }
  });
};

export default submitApply;
