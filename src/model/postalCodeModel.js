const mongoose = require('../config/dbConnection')

const postalCodeSchema = new mongoose.Schema({

    postal_code:{
        type: Number,
    },
    city_id: {
        type : mongoose.Types.ObjectId,
        ref: 'city'
    },
    state_id: {
        type : mongoose.Types.ObjectId,
        ref: 'state'
    },
    country_id: {
        type : mongoose.Types.ObjectId,
        ref: 'country'
    },
    is_active:{
        type:Boolean,
        default: true
    },
    is_deleted:{
        type:Boolean,
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

module.exports = new mongoose.model('postalcode', postalCodeSchema)
