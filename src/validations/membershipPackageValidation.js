const Joi = require('joi');

const packageValidation = {

    createPackage : (data) => {

        const body = Joi.object().keys({
            package_name: Joi.string().required()
          });
          return body.validate(data);

    },

    updatePackage : (data) => {
        const body = Joi.object().keys({
            package_name: Joi.string()
        })

        return body.validate(data)
    }
}

module.exports = { packageValidation }