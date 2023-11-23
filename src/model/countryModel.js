const mongoose = require('../config/dbConnection')

const countrySchema = new mongoose.Schema({

    country_name: {
        type: String,
    },
    short_name: {
        type: String,
    },
    phone_code: {
        type: Number,
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default: false

    },
    deletedAt: {
        type: Date,
        default: null
    }
},
    {
        timestamps: true
    }
);

module.exports = new mongoose.model('country', countrySchema)
