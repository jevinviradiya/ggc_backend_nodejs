const models = require('../model/index');
const User = models.user;
const jwt = require('jsonwebtoken');
const helper = require('../helper/helper-function');
const responseData = require('../helper/response');

const verifyUserToken = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const userExist = await User.findOne({token: token, is_deleted:false})

      if(userExist){
        const decoded = jwt.verify(token, process.env.USER_SECRET_KEY);
        
        req.user = await User.findOne({
          _id: decoded._id,
          mobile_number: decoded.mobile_number,
        });
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

module.exports = {verifyUserToken};
