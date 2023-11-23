const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const {send_email} = require('../../helper/sendEmail');
// const { sendSMS } = require('../../helper/sendSms');
const {checkIdentity} = require('../../helper/helper-function');
const {HasPass} = require('../../helper/HasPass');
const {genOtp} = require('../../helper/generateOtp');
const responseData = require('../../helper/response');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { userValidation } = require('../../validations/userValidation');
const { generateToken } = require('../../utils/generateToken');
const { sendSMS } = require('../../helper/sendSms');
const User = models.user;
const Token = models.tokens;
const Otp = models.otp;
const Wallet = models.wallet;


//User signup
const userSignup = async (req, res) => {

    try {
        const { mobile_number, phone_code, email, password, confirm_password } = req.body;

        const userValidate = await userValidation.userSignupValidation(req.body);

        if(userValidate.error){
            return responseData.errorResponse(res, userValidate.error.details[0].message);
        }
            let bodyData = {}

            if(password !== confirm_password ){
             return responseData.errorResponse(res, 'Password and confirm password does not match!');
            }   
            // if(req.body.sign_up_identity){        // sign_up_identity should be email or phone number
            
            // if(identity.isEmail == true){

            //   bodyData = {email : req.body.sign_up_identity}

            //         const userSignUp = await User.create(bodyData);
            //         userSignUp.save();

            //         if(userSignUp){
            //             // send otp in mail
            //             const sendMail = await send_email(bodyData)
                        
            //             if(sendMail){
            //                 responseData.sendResponse(
            //                     res,
            //                     'Please check provided email for OTP!',
            //                 );  
            //             }else{
            //               responseData.errorResponse(res, 'Error sending OTP:');
            //             }
            //         }else{
            //             responseData.errorResponse(res, 'User signup failed!');
            //         }
               
        const emailExistence = await User.findOne({ email: email, is_deleted: false });

        if (emailExistence) {
            return responseData.sendMessage(
                res,
                'User already exist with this email!',
            );
        }

        const mobileExistence = await User.findOne({ mobile_number: mobile_number, is_deleted: false });
        // bodyData = {mobile_number : req.body.sign_up_identity}

        if (mobileExistence) {
            return responseData.sendMessage(
                res,
                'User already exist with this mobile number!',
            );
        }

        const identity = await checkIdentity(mobile_number)

        if (identity.isPhone == true) {
           
              bodyData.password = await HasPass(confirm_password);
            //   bodyData.otp = await genOtp(mobile_number);
              bodyData.mobile_number = mobile_number;
              bodyData.email = email;
              bodyData.phone_code = phone_code;
              const userSignUp = await User.create(bodyData);
              userSignUp.save();
              if(userSignUp){
                    const userWallet = await Wallet.create({user_id : userSignUp._id })
                      
                    const userWalletUpdate = await User.findByIdAndUpdate({_id: userWallet.user_id }, {wallet_id: userWallet._id })
                    
                    if(userWalletUpdate){

                        const userData = await User.findOne({_id: userSignUp._id })
    
                          //create otp
                         const send_sms = await sendSMS(mobile_number)
                         
                         if(send_sms){
                         return  responseData.sendResponse(
                            res,
                            'Please check provided mobile_number for otp! ',
                            userData
                        );       
                         }else{
                          responseData.errorResponse(res, 'Error sending OTP:');
                         }
                    }else{
                     return responseData.errorResponse(res, 'User wallet store failed!');

                    }

                   }else{
                     return responseData.errorResponse(res, 'User signup failed!');
                   }
             
            
          }else{
            responseData.errorResponse(res, 'Error sending OTP:');
          }
        
    } catch (error) {
         helper.logger.error(error);
         responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Verify otp for user
const verifyOtpUser = async (req, res) => {
    try {
          const {mobile_number, otp, device_id} = req.body;
          
          const verifyOtpValidate = await userValidation.verifyOtp(req.body)

          if(verifyOtpValidate.error){
            return responseData.errorResponse(res, verifyOtpValidate.error.details[0].message);
        }

        //   const validOtp = await otpValidation(req.body);

        //   if (validOtp.error) {
        //     return responseData.sendMessage(res, validOtp.error.message);
        //   }

        // if (req.body.verify_identity) {                           // login_identity should be emaiverifyone number
         
        //     const identity = await checkIdentity(req.body.verify_identity)

        //     const otpModelData = await Otp
        //         .findOne({ otp: req.body.otp })
        //         .lean()
        //         .sort({ date: -1 });

        //     if (identity.isEmail == true) {
        //         if (otpModelData) {
        //             if (otpModelData.email != req.body.verify_identity) {
        //                 return responseData.sendMessage(
        //                     res,
        //                     'OTP was not sent to this email',
        //                 );
        //             } else {
        //                 const checkEmail = await User.findOne({
        //                     email: req.body.verify_identity,
        //                     is_deleted: false,
        //                 });
        //                 if (checkEmail) {
        //                     if (otpModelData.otp_expiration_time >= new Date()) {
        //                         const token = jwt.sign(
        //                             {
        //                                 _id: checkEmail._id,
        //                                 email: otpModelData.email,
        //                             },
        //                             process.env.USER_SECRET_KEY,
        //                         );
        //                         await User.findOneAndUpdate(
        //                             { email: req.body.verify_identity},
        //                             { token: token, verified_user: true },
        //                         );
        //                         const response = {
        //                             email:  req.body.verify_identity,
        //                             token: token,
        //                         };
        //                         return responseData.sendResponse(res, 'OTP verified successfully', response);
        //                     } else {
        //                         return responseData.sendMessage(res, 'OTP Expired');
        //                     }
        //                 } else {
        //                     responseData.sendMessage(res, 'Please check email, your entered email is not exist.');
        //                 }
        //             }
        //         } else {
        //             return responseData.sendMessage(
        //                 res,
        //                 'Please check OTP, your entered OTP is wrong',
        //             );
        //         }
        //     }

        //     if (identity.isEmail == true) {

        //         if (otpModelData) {
        //             if (otpModelData.mobile_number != req.body.verify_identity) {
        //                 return responseData.sendMessage(
        //                     res,
        //                     'OTP was not sent to this phone number',
        //                 );
        //             } else {
        //                 const checkPhoneNumber = await User.findOne({
        //                     mobile_number: req.body.verify_identity,
        //                     is_deleted: false,
        //                 });
        //                 if (checkPhoneNumber) {
        //                     if (otpModelData.otp_expiration_time >= new Date()) {
        //                         const token = jwt.sign(
        //                             {
        //                                 _id: checkPhoneNumber._id,
        //                                 mobile_number: otpModelData.mobile_number,
        //                             },
        //                             process.env.USER_SECRET_KEY,
        //                         );
        //                         await User.findOneAndUpdate(
        //                             { mobile_number: req.body.verify_identity },
        //                             { token: token, verified_user: true },
        //                         );
        //                         const response = {
        //                             mobile_number: req.body.verify_identity,
        //                             token: token,
        //                         };
        //                         return responseData.sendResponse(res, 'OTP verified successfully', response);
        //                     } else {
        //                         return responseData.sendMessage(res, 'OTP Expired');
        //                     }
        //                 } else {
        //                     responseData.sendMessage(res, 'Please check mobile number, your entered mobile number is not exist.');
        //                 }
        //             }
        //         } else {
        //             return responseData.sendMessage(
        //                 res,
        //                 'Please check OTP, your entered OTP is wrong',
        //             );
        //         }

        //     }
        // }

        const userExistence = await User.findOne({mobile_number:mobile_number, is_deleted:false})
        if(userExistence){

            const validOtp = await Otp.findOne({mobile_number:mobile_number, otp:otp}).lean()
            .sort({ date: -1 });
         
            if(validOtp){
                

                    let token = await generateToken(userExistence, device_id);   
                    
                    await User.findOneAndUpdate(
                            { mobile_number: userExistence.mobile_number},
                            { verified_user: true },
                        );             
                    
                    const updated_user =  await User.findOne({mobile_number:mobile_number, is_deleted:false})
                    
                    const response = {
                       token: token.token,
                       user:updated_user
                     }
                        return responseData.sendResponse(res, 'OTP verified successfully', response);


                    // } else {
                    //     return responseData.sendMessage(res, 'OTP Expired');
                    // }

            }else{
                return responseData.sendMessage(res, 'Please provide valid otp');
            }
      
    } else{
         return responseData.sendMessage(res, 'User not found!', []);

    }
} catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}



//Verify otp for user
const verifyOtpUserWeb = async (req, res) => {
    try {
        const { mobile_number, otp, } = req.body;

        const verifyOtpValidate = await userValidation.verifyOtp(req.body)

        if (verifyOtpValidate.error) {
            return responseData.errorResponse(res, verifyOtpValidate.error.details[0].message);
        }

        const validOtp = await Otp.findOne({ mobile_number: mobile_number, otp: otp }).lean()
            .sort({ date: -1 });

        if (validOtp) {

            return responseData.sendResponse(res, 'OTP verified successfully');

        } else {
            return responseData.sendMessage(res, 'Please provide valid otp');
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}
//forgot password 
const forgotPassword = async (req, res) => {
    try {
        
        const { mobile_number, email } = req.body;

        const userExistence = await User.findOne({ mobile_number: mobile_number, email:email, is_deleted: false })

        if (userExistence) {

            let OTP = await genOtp();
            const sendOtp = await User.findOneAndUpdate({ mobile_number: mobile_number }, { otp: OTP })

            if (sendOtp) {
                return responseData.sendResponse(
                    res,
                    'Otp Sent Successfully!',
                );
            } else {
                return responseData.sendMessage(res, 'Otp send failed!');
            }

        } else {
            return responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');    
    }
}

//Reset password
const resetPassword = async (req, res) => {
    try {
        
        const {password, confirm_password, mobile_number} = req.body

        if(password !== confirm_password ){
            return responseData.errorResponse(res, 'Password and confirm password does not match!');
        }
        
        const userExistence = await User.findOne({mobile_number:mobile_number, is_deleted:false})
        
        if(userExistence){
            //send-otp on mobile number 

            const new_password = await HasPass(confirm_password);
    
            const updatePassword = await User.findOneAndUpdate(
                { mobile_number: mobile_number }, 
                { password: new_password })
    
                if(updatePassword){
                    return responseData.sendResponse(res, 'Password reset successfully!');
                }

        }else{
            return responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// User login
const userLogin = async (req, res) => {
    try {
        
        const { mobile_number, email, password, device_id} = req.body;

        const loginValidate = await userValidation.loginvalidation(req.body);

        if(loginValidate.error){
            return responseData.errorResponse(res, loginValidate.error.details[0].message);
        }
        
        const userExistence = await User.findOne({mobile_number:mobile_number, email:email, is_deleted:false})
     
        if(userExistence){

            const validPassword = bcrypt.compareSync(password, userExistence.password)
            
            if(validPassword){

                let token = await generateToken(userExistence, device_id)

                            await User.findOneAndUpdate(
                                { mobile_number:mobile_number},
                                { verified_user: true },
                            );
                            const verifiedUser = await User.findOne({
                                mobile_number:mobile_number,
                            });

                            const response = {
                                token : token.token,
                                user : verifiedUser
                            }
                
                            responseData.sendResponse(
                                res,
                                'User Login successfully!',
                                response
                            ); 

            }else{
                 responseData.errorResponse(res, 'Please provide valid password!');
            }

        }else{
         return responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// User logout
const userLogOut = async (req, res) => {
    try {

        const {device_id} = req.body
        const userExist = await User.findOne( {
            _id: req.user._id, is_deleted:false
        })
        if(!userExist){
            return responseData.sendMessage(res, 'User not found', []);
        }

        await Token.findOneAndDelete(
            {
              user_id: req.user._id,
              device_id: device_id
            }
          );
        const user = await User.findByIdAndUpdate(
            {
                _id: req.user._id,
            },
            { verified_user: false }
            );
            
          if(user){
            return responseData.sendResponse(res, 'User logout successfully!');
          }else{
            return responseData.sendMessage(res, 'User logout failed!');
          }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}


module.exports = {userSignup, userLogin, verifyOtpUser, resetPassword, forgotPassword, userLogOut, verifyOtpUserWeb};
