require('dotenv').config();
const winston = require('winston');
const models = require('../model/index');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({
        filename: 'logger/debug.log',
      }),
    ],
  });


const checkIdentity = async(identity) => {
  // return new Promise((resolve, reject) => {

    const validateEmail = (email) => {
      const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      return emailRegex.test(email);
  }
  
    const validatePhone = (phone) => { 
      var phoneRegex = /^(\+91-|\+91|0)?\d{10}$/; 
      return phoneRegex.test(phone);
  }

  if(identity){
    const isEmail = validateEmail(identity);
    const isPhone = validatePhone(identity);

    if (isEmail) { 
      return ({isEmail:true});
      // resolve(isEmail) 
    } else if (isPhone) { 
      return ({isPhone:true});
        // resolve(isPhone) 
      } 
      else {
      return null
        // reject();
      }
    }
  // })
}


module.exports = {logger, checkIdentity};