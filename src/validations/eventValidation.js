const Joi = require('joi');

const eventValidation =  {

    createEventValidation: (data) => {
        const body = Joi.object().keys({
            chapter_id: Joi.string(),
            event_image: Joi.string().allow(''),
            event_description : Joi.string(),
            event_name: Joi.string(),
            event_type: Joi.string(),
            venue: Joi.string(),
            venue_link: Joi.string(),
            price: Joi.number(),
            start_time: Joi.date(),
            end_time: Joi.date(),
            city_id: Joi.string(),
            state_id: Joi.string(),
            country_id: Joi.string(),
            postalcode_id: Joi.string(),
        });
        return body.validate(data);
    },

}

module.exports = {eventValidation}
