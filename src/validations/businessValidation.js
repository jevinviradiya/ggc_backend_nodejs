const Joi = require('joi');

const businessValidation =  {

    createBusinessValidation: (data) => {
        const body = Joi.object().keys({
          business_name: Joi.string(),
          owner_firstname: Joi.string(),
          owner_lastname: Joi.string(),
          business_logo: Joi.string(),
          business_email: Joi.string(),
          business_contact: Joi.number(),
          establish_year: Joi.string(),
          business_catagory_id: Joi.string(),
          annual_turnover: Joi.number(),   
          business_website: Joi.string(),
          address: Joi.string(),
          city_id: Joi.string(),
          state_id: Joi.string(),
          postalcode_id: Joi.string(),
          country_id: Joi.string(),
          chapter_id: Joi.string(),
          representative_1: Joi.object(),
          representative_2: Joi.object(),
          business_card: Joi.string().allow(''),
         
        });
        return body.validate(data);
    },

}

module.exports = {businessValidation}