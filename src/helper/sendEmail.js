require('dotenv').config();
const nodemailer = require('nodemailer');       //by the help of nodmailer sending verification otp on email
const {genOtp} = require('./generateOtp') 


let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass : process.env.PASSWORD,
  },
});


const send_email = async (data) => {
  try {

    const otp = await genOtp(data)

    let subject = "varification otp";
    let body = `Otp for verification: ${otp.otp}\n` +
              `Please do not share it with anyone.\n` +
              `Thanks,\n` +
              `GGCommunity`

    let mail_data = {
      from: process.env.EMAIL,
      to: data.email,
      subject: subject,
      text: body,
    };

    return new Promise((resolve, reject) => {
      mailTransporter.sendMail(mail_data, (err, info) => {   
        if (err) {
          reject(err)
        } else {
          resolve(info)        }
      });
      })
  } catch (error) {throw error}
};

module.exports = {send_email};