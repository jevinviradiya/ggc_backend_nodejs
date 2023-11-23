const mongoose = require('../config/dbConnection')

const membershipModelSchema = new mongoose.Schema(
    {
        membership_name: {
            type: String,
            required: true
        },
        min_range_amount: {
            type: Number,
            required : true
        },
        max_range_amount: {
            type: Number,
            required : true
        },
        range_type: {
            type: String,
            required : true
        },
        monthly_price: {
            type: Number,
            default: null
        },
        yearly_price: {
            type: Number,
            default: null
        },
        discount: {
            type: Number,
            default: null
        },
        description: {
            type: Array
        },
        purchased_by: {
            type: Array,
            default: []
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        is_active: {
            type: Boolean,
            default: true
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

module.exports = new mongoose.model('membership', membershipModelSchema)
