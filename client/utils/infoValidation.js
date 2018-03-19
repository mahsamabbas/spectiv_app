const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const infoValidation = (type, nameValue, descValue, emailValue, tags) => {
  return new Promise((resolve) => {
    if (type === 'Channel' && /[^'\s\w]/g.test(nameValue)) {
      resolve({ alertMsg: `${type} name cannot contain special characters (i.e. !@#$%^&*)`, alert: true });
    } else if (type === 'Channel' && nameValue.length > 32) {
      resolve({ alertMsg: `${type} name cannot exceed 32 characters`, alert: true });
    } else if (type === 'Video' && nameValue.length > 60) {
      resolve({ alertMsg: `${type} name cannot exceed 60 characters`, alert: true });
    } else if (nameValue.length === 0) {
      resolve({ alertMsg: `${type} name cannot be empty`, alert: true });
    } else if (descValue.length > 600) {
      resolve({ alertMsg: `${type} description cannot exceed 600 characters`, alert: true });
    } else if (emailValue && !validateEmail(emailValue)) {
      resolve({ alertMsg: 'Business email needs to be a valid email', alert: true });
    } else if (tags && tags.length > 16) {
      resolve({ alertMsg: 'You can only have a maximum of 16 tags', alert: true });
    }
    resolve({ alertMsg: '', alert: false });
  });
};

export default infoValidation;
