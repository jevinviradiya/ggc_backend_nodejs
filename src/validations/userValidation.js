const Joi = require('joi');

const userValidation = {
  createUserValidation: (data) => {
    const body = Joi.object().keys({

          first_name: Joi.string(),
          last_name: Joi.string(),
          birth_date: Joi.date(),
          address: Joi.string(),
          city_id: Joi.string(),
          state_id: Joi.string(),
          postalcode_id: Joi.string(),
          country_id: Joi.string(),
          gender: Joi.string(),
          email: Joi.string(),
          profile_picture: Joi.string().allow(''),
          mobile_number: Joi.number()
          .integer()
          .min(10 ** 9)
          .max(10 ** 10 - 1),
          phone_code: Joi.number(),
          email: Joi.string().email(),
          role_id: Joi.string(),
          chapterId_refferalType: Joi.string(),
          password: Joi.string(),
          confirm_password: Joi.string(),
    });

    return body.validate(data);
  },

    userSignupValidation: (data) => {
    const body = Joi.object().keys({
      mobile_number: Joi.number()
          .integer()
          .min(10 ** 9)
          .max(10 ** 10 - 1)
          .required(),
          phone_code: Joi.number(),
          email: Joi.string().email(),
          password: Joi.string(),
          confirm_password: Joi.string(),
    });

    return body.validate(data);
  },

    verifyOtp: (data) => {
    const body = Joi.object().keys({
      mobile_number: Joi.number()
          .integer()
          .min(10 ** 9)
          .max(10 ** 10 - 1)
          .required(),
          otp: Joi.number(),
      device_id: Joi.string(),

    });

    return body.validate(data);
  },

    loginvalidation: (data) => {
    const body = Joi.object().keys({
      mobile_number: Joi.number()
      .integer()
      .min(10 ** 9)
      .max(10 ** 10 - 1).required(),
      country_code: Joi.string(),
      email: Joi.string().email(),
      device_id: Joi.string(),
      password: Joi.string(),
    });
    return body.validate(data);
  },

    getUserByIdValidation: (data) => {
    const schema = Joi.object({
      query: {
        userId: Joi.string().required(),
      },
    });
    return schema.validate(data);
  },

     updateUserValidation: (data) => {
      const body = Joi.object().keys({

        first_name: Joi.string(),
        last_name: Joi.string(),
        birth_date: Joi.date(),
        address: Joi.string(),
        city_id: Joi.string(),
        state_id: Joi.string(),
        postalcode_id: Joi.string(),
        country_id: Joi.string(),
        gender: Joi.string(),
        email: Joi.string(),
        profile_picture: Joi.string().allow(''),
        mobile_number: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1),
        phone_code: Joi.number(),
        email: Joi.string().email(),
        role_id: Joi.string(),
        chapterId_refferalType: Joi.string(),
        is_active: Joi.string()
    })
    return body.validate(data);
  },
};

module.exports = {userValidation};
