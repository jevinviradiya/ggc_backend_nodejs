const models = require('../../model/index')
const helper = require('../../helper/helper-function');
const {send_email} = require('../../helper/sendEmail');
// const { sendSMS } = require('../../helper/sendSms');
const {checkIdentity} = require('../../helper/helper-function')
const responseData = require('../../helper/response')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { HasPass } = require('../../helper/HasPass');
const { genOtp } = require('../../helper/generateOtp');
const { adminValidation } = require('../../validations/adminValidation')
const { generateToken } = require('../../utils/generateToken')
const User = models.user;
const Admin = models.admin;
const Otp = models.otp;
const Token = models.tokens;


//Admin login
const adminLogin = async (req, res) => {
    
    try {

        const { device_id } = req.body;
        const loginValidate = await adminValidation.loginvalidation(req.body);

        if(loginValidate.error){
            return responseData.errorResponse(res, loginValidate.error.details[0].message);
        }


        let adminExistence;
        if(req.body.email){
            adminExistence = await User.findOne({email: req.body.email, is_deleted: false});
        }
        if(req.body.mobile_number){
            adminExistence = await User.findOne({mobile_number: req.body.mobile_number, is_deleted: false});
        }

        if(adminExistence){
        
            const validPassword = bcrypt.compareSync(req.body.password, adminExistence.password)

            if(validPassword){


             let token =  await generateToken(adminExistence, device_id);

        await User.findOneAndUpdate(
            { mobile_number: adminExistence.mobile_number},
            { verified_admin: true, is_active: true, last_logIn: new Date() },
        );

        let veryfiedAdmin = await User.aggregate([
            {
                '$match': {
                    mobile_number: adminExistence.mobile_number, 
                    is_deleted : false             
                }
            },
            {
                '$lookup': {
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'user_role'
                }
            }, {
                '$unwind': {
                    'path': '$user_role'
                }
            },
            {
                '$project': {
                    'user_role.is_active': 0,
                    'user_role.is_deleted': 0,
                    'user_role.deletedAt': 0,
                    'user_role.createdAt': 0,
                    'user_role.updatedAt': 0,
                    'user_role.__v': 0,
                }
            }

        ])

                const response = {
                    token: token.token,
                    admin: veryfiedAdmin[0]
                }

        responseData.sendResponse(
            res,
            'Welcome Admin!',
            response
        ); 
        } else 
        {
            responseData.errorResponse(res, 'Please provide valid password!');
        }

        //through otp or password

        }else{
         return responseData.sendMessage(res, 'Admin not found!', []);

        }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Verify otp for Admin
const verifyOtpAdmin = async (req, res) => {
  try {

      if (req.body.verify_identity) {                           // login_identity should be emaiverifyone number
    
       const identity = await checkIdentity(req.body.verify_identity)
        
         
          const otpModelData = await Otp
              .findOne({ otp: req.body.otp })
              .lean()
              .sort({ date: -1 });

          if (identity.isEmail == true) {
              if (otpModelData) {
                  if (otpModelData.email != req.body.verify_identity) {
                      return responseData.sendMessage(
                          res,
                          'OTP was not sent to this email',
                      );
                  } else {
                      const checkEmail = await Admin.findOne({
                          email: req.body.verify_identity,
                          is_deleted: false,
                      });
                      if (checkEmail) {
                          if (otpModelData.otp_expiration_time >= new Date()) {
                            let expire_time = 30 * 60 * 60
                              const token = jwt.sign(
                                  {
                                      _id: checkEmail._id,
                                      email: otpModelData.email,
                                  },
                                  process.env.USER_SECRET_KEY,
                                  {
                                    expiresIn: expire_time
                                  }
                              );
                              await Admin.findOneAndUpdate(
                                  { email: req.body.verify_identity},
                                  { access_token: token, verified_admin: true },
                              );
                              const response = {
                                  email:  req.body.verify_identity,
                                  token: token,
                              };
                              return responseData.sendResponse(res, 'OTP verified successfully', response);
                          } else {
                              return responseData.sendMessage(res, 'OTP Expired');
                          }
                      } else {
                          responseData.sendMessage(res, 'Please check email, your entered email is not exist.');
                      }
                  }
              } else {
                  return responseData.sendMessage(
                      res,
                      'Please check OTP, your entered OTP is wrong',
                  );
              }
          }

          if (identity.isPhone == true) {

              if (otpModelData) {
                  if (otpModelData.mobile_number != req.body.verify_identity) {
                      return responseData.sendMessage(
                          res,
                          'OTP was not sent to this phone number',
                      );
                  } else {
                      const checkPhoneNumber = await Admin.findOne({
                          mobile_number: req.body.verify_identity,
                          is_deleted: false,
                      });
                      if (checkPhoneNumber) {
                          if (otpModelData.otp_expiration_time >= new Date()) {
                            let expire_time = 30 * 60 * 60

                              const token = jwt.sign(
                                  {
                                      _id: checkPhoneNumber._id,
                                      mobile_number: otpModelData.mobile_number,
                                  },
                                  process.env.USER_SECRET_KEY,
                                  {
                                    expiresIn: expire_time
                                  }
                              );
                              await User.findOneAndUpdate(
                                  { mobile_number: req.body.verify_identity },
                                  { token: token, verified_user: true },
                              );
                              const response = {
                                  mobile_number: req.body.verify_identity,
                                  token: token,
                              };
                              return responseData.sendResponse(res, 'OTP verified successfully', response);
                          } else {
                              return responseData.sendMessage(res, 'OTP Expired');
                          }
                      } else {
                          responseData.sendMessage(res, 'Please check mobile number, your entered mobile number is not exist.');
                      }
                  }
              } else {
                  return responseData.sendMessage(
                      res,
                      'Please check OTP, your entered OTP is wrong',
                  );
              }

          }
      }

  } catch (error) {
      helper.logger.error(error);
      responseData.errorResponse(res, 'Something went wrong!');
  }
}

//Admin logout
const adminLogOut = async (req, res) => {
    try {

        const { device_id } = req.body
        const adminExist = await User.findOne( {
            _id: req.user._id, is_deleted:false
        })
        if(!adminExist){
            return responseData.sendMessage(res, 'Admin not found', []);
        }


         await Token.findOneAndRemove(
            {
                user_id: req.user._id,
                device_id: device_id
            }
            );

          const adminUpdate = await User.findByIdAndUpdate({_id:req.user._id}, {verified_admin: false})
    
          if(adminUpdate){
            return responseData.sendResponse(res, 'Admin logout successfully!');

          }else{
            return responseData.errorResponse(res, 'Admin logout failed!');

          }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

module.exports = {adminLogin, verifyOtpAdmin, adminLogOut};