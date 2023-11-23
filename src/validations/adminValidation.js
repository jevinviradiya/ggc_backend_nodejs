const Joi = require('joi');

const adminValidation = {

    loginvalidation: (data) => {
    const body = Joi.object().keys({
      mobile_number: Joi.number()
      .integer()
      .min(10 ** 9)
      .max(10 ** 10 - 1),
      email: Joi.string().email(),
      device_id: Joi.string(),
      password: Joi.string().required(),
    });
    return body.validate(data);
  },

};

module.exports = {adminValidation};
