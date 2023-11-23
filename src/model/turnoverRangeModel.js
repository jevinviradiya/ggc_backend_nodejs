const mongoose = require('../config/dbConnection')

const rangeModelSchema = new mongoose.Schema(
    {
        range_name : {
            type: String
        },
        min_value : {
            type: Number,
            default: null
        },
        max_value : {
            type: Number,
            default: null
        },
        is_active : {
            type: Boolean,
            default: true
        },
        is_deleted : {
            type: Boolean,
            default: false
        },
        deletedAt : {
            type: Date,
            default:null
        }
    },
    {
        timestamps: true
    }
)

module.exports = new mongoose.model('turnover_range', rangeModelSchema)