const moment = require('moment');

const generateMessage = (from, text) => {
  return {
    from, 
    text, 
    createdAt: moment().valueOf(new Date().getTime())
  }
};

module.exports = {
  generateMessage
}