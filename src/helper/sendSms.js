const AWS = require('aws-sdk');
const {genOtp} = require('./generateOtp')


// Configure AWS region
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  // Create an SNS client
  const sns = new AWS.SNS();
  
  const sendSMS = async (mobile_number) => {
      try {
        const otp = await genOtp(mobile_number);

        const message = `<#> Your verification OTP is ${otp}. Please do not share it with anyone.\n` +
        `Thanks,\n` +
        `GGCommunity`;

    const params = {
        Message: message,
        PhoneNumber: `+91 ${mobile_number}`,
    };
  
      let sms =  await sns.publish(params).promise();
      if(sms){
        return sms;
      }
    } catch (error) {
        throw new Error(error)    }
      };

module.exports =  {sendSMS}