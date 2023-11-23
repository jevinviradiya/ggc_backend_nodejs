const Joi = require('joi');

const membershipValidation = {

    createMembership : (data) => {

        const body = Joi.object().keys({
            membership_name: Joi.string().required(),
            min_range_amount: Joi.number().required(),
            max_range_amount: Joi.number().required(),
            range_type: Joi.string().required(),
            monthly_price: Joi.number().allow(null),
            yearly_price: Joi.number().allow(null),
            description: Joi.array()
          });
          return body.validate(data);

    },

    updateMembership : (data) => {
        const body = Joi.object().keys({
            membership_name: Joi.string(),
            min_range_amount: Joi.number(),
            max_range_amount: Joi.number(),
            range_type: Joi.string(),
            monthly_price: Joi.number().allow(null),
            yearly_price: Joi.number().allow(null),
            description: Joi.array(),
            is_active: Joi.string()
        })

        return body.validate(data)
    }
}

module.exports = { membershipValidation }
