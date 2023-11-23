const Joi = require('joi');

const requestVaidation = {

    createRequest : (data) => {

        const body = Joi.object().keys({
            name: Joi.string(),
            email: Joi.string().email(),
            phone_code: Joi.number(),
            mobile_number: Joi.number()
            .integer()
            .min(10 ** 9)
            .max(10 ** 10 - 1),
            postalcode_id: Joi.string().required(),
            role_id: Joi.string(),
            city_id: Joi.string(),
            state_id: Joi.string(),
            country_id: Joi.string(),
            message: Joi.string(),
          });
          return body.validate(data);

    }
}

module.exports = { requestVaidation }  
