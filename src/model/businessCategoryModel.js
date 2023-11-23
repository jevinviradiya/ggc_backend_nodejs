const mongoose = require('../config/dbConnection')

const categorySchema = new mongoose.Schema(
    {
        category_name : {
            type: String,
            required: true
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

module.exports = new mongoose.model('business_category', categorySchema)