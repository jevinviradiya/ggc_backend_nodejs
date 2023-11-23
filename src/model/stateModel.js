const mongoose = require('../config/dbConnection')

const stateSchema = new mongoose.Schema({

    state_name: {
        type: String,
    },
    country_id: {
        type: mongoose.Types.ObjectId,
        ref: 'country'
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


module.exports = new mongoose.model('state', stateSchema)
