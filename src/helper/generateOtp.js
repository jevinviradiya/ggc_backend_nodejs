const models = require('../model/index');
const Otp = models.otp;


const genOtp = async(mobile_number) => {
    try {
        function AddMinutesToDate(date, minutes) {              //set expiration time of 10 minutes
            return new Date(date.getTime() + minutes * 60000);
          }
      
          function generateRandomNumber(min, max) {             // generated otp
            return Math.floor(Math.random() * (max - min) + min);
          }

          const otp = generateRandomNumber(100000, 999999);
          const now = new Date();
          const otp_expiration_time = AddMinutesToDate(now, 10);
      
          let otpInfo = {};
          if(mobile_number){
              otpInfo = {
                  mobile_number: mobile_number,
                  otp,    
                  now,
                  otp_expiration_time,
                };
            }
            // for email 
            // if(data.email){
            //     otpInfo = {
            //         email: data.email,
            //         otp,
            //         now,
            //         otp_expiration_time,
            //     }
            // }
          
        const otpCreation = await Otp.create(otpInfo);
        if(!otpCreation){
            throw new Error(error)
        }
        return otp;

      
    } catch (error) {   
        throw new Error(error)
    }
}

module.exports = { genOtp }