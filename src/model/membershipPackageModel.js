const mongoose = require('../config/dbConnection')

const membershipModelSchema = new mongoose.Schema(
    {
        package_name : {
            type: String,
            // required: true
        },
        is_active : {
            type: String,
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

module.exports = new mongoose.model('membership_packages', membershipModelSchema)