const models = require('../model/index');
const User = models.user;
const Token = models.tokens;
const Admin = models.admin;
const jwt = require('jsonwebtoken');  
const helper = require('../helper/helper-function');
const responseData = require('../helper/response');

const verifyToken = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const tokenExist = await Token.findOne({token: token, active: true})

      if(tokenExist){
        const decoded = jwt.verify(token, process.env.USER_SECRET_KEY);
        let userExist = await User.findOne({
          _id: decoded._id,
          mobile_number: decoded.mobile_number,
        }) 
        let adminExist =  await Admin.findOne({
          _id: decoded._id,
          mobile_number: decoded.mobile_number,
        }) 
        if(userExist){
          req.user = userExist
        }else{
          req.user = adminExist
        }
        next();
      }else{
        helper.logger.error('Authorization failed');
        return responseData.errorResponse(res, 'Authorization failed');
      }

    } else {
      helper.logger.error('Authorization failed');
      return responseData.errorResponse(res, 'Authorization failed');
    }
    if (!token) {
      helper.logger.error('Token not found');
      return responseData.errorResponse(res, 'Token not found');
    }
  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
};

module.exports = {verifyToken};
