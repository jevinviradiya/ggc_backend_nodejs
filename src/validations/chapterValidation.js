const Joi = require('joi');

const chapterValidation = {

    createChapter : (data) => {

        const body = Joi.object().keys({
            chapter_name: Joi.string().required(),
            country_id: Joi.string().required(),
            state_id: Joi.string().required(),
            city_id: Joi.string().required(),
            postalcode_id: Joi.string().required(),
            chapter_image: Joi.string(),
            chapter_desc: Joi.string(),
          });
          return body.validate(data);

    },

    updateChapter : (data) => {
        const body = Joi.object().keys({
            chapter_name: Joi.string(),
            country_id: Joi.string(),
            state_id: Joi.string(),
            city_id: Joi.string(),
            postalcode_id: Joi.string(),
            chapter_desc: Joi.string(),
            is_active: Joi.boolean()
        })

        return body.validate(data)
    }
}

module.exports = { chapterValidation }  