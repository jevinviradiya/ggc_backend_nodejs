const {send_email} = require('./sendEmail');
// const { sendSMS } = require('./sendSms');
const {checkIdentity} = require('./helper-function')
const helper = require('./helper-function');
const responseData = require('./response')
const models = require('../model/index')
const {genOtp} = require('./generateOtp');
const { sendSMS } = require('./sendSms');
const User = models.user;
const Otp = models.otp;

const resendOtp = async (req, res) => {
    try {

        //   if (req.body.otp_identity) {                       // otp_identity should be email or phone number
        //         bodyData = {email : req.body.otp_identity}

        //       const identity = await checkIdentity(req.body.otp_identity)

        //       if (identity.isEmail == true) {

        //           // send otp in mail
        //           const sendMail = await send_email(bodyData)

        //           if (sendMail) {
        //               responseData.sendResponse(
        //                   res,
        //                   'Please check provided email for OTP!',
        //               );
        //           } else {
        //               responseData.errorResponse(res, 'Error sending OTP:');
        //           }
        //       }

        //       if (identity.isPhone == true) {
        //         bodyData = {mobile_number : req.body.otp_identity}

        //           //create otp
        //           const send_sms = await sendSMS(bodyData)
        //           if (send_sms) {
        //               responseData.sendResponse(
        //                   res,
        //                   'Please check provided mobile number for OTP!',
        //               );
        //           } else {
        //               responseData.errorResponse(res, 'Error sending OTP:');
        //           }
        //       }
        //   }else{
        //     responseData.errorResponse(res, 'Please provide valid otp');
        //   }

        const { mobile_number } = req.body;

        const userExistence = await User.findOne({ mobile_number: mobile_number, is_deleted: false })

        if (userExistence) {

            let OTP = await genOtp();
            await Otp.findOneAndUpdate({ mobile_number: mobile_number }, { otp: OTP })
           const send_otp =  await sendSMS(mobile_number)

            if (send_otp) {
                return responseData.sendResponse(
                    res,
                    'Otp Sent Successfully!',
                );
            } else {
                return responseData.sendMessage(res, 'Error sending OTP');
            }

        } else {
            return responseData.sendMessage(res, 'User not found!', []);
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const sendOtpWeb = async (req, res) => {
    try {

        const { mobile_number } = req.body;

            let OTP = await genOtp();
            await Otp.findOneAndUpdate({ mobile_number: mobile_number }, { otp: OTP })
           const send_otp =  await sendSMS(mobile_number)

            if (send_otp) {
                return responseData.sendResponse(
                    res,
                    'Otp Sent Successfully!',
                );
            } else {
                return responseData.sendMessage(res, 'Error sending OTP');
            }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}
module.exports = {resendOtp, sendOtpWeb}