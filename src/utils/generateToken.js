const jwt = require('jsonwebtoken');
const models = require('../model/index');
const Token = models.tokens;


const generateToken = async (userData, device_id) => {

    const token = jwt.sign({
        _id: userData._id,
        email: userData.email,
        mobile_number: userData.mobile_number,
    },
    process.env.USER_SECRET_KEY,
    {
        expiresIn: '1d'
    }
    )
    let tokenData = {
        token : token,
        user_id : userData._id,
        device_id : device_id
    }
    let createToken = await Token.create(tokenData);
    createToken.save()
    return createToken
    
}

module.exports = {generateToken};