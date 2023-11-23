const mongoose = require('../config/dbConnection')

const partnerRequestModelSchema = new mongoose.Schema(
    {
        name : {
            type: String,
            // required: true
        },
        email : {
            type: String,
        },
        phone_code : {
            type: Number,        
        },
        mobile_number:{                             
            type: Number,              
        },
        role_id: {
            type: mongoose.Types.ObjectId,
            ref: 'role'
        },
        city_id: {
            type: mongoose.Types.ObjectId,
            ref: 'city'
        },
        state_id: {
            type: mongoose.Types.ObjectId,
            ref: 'state'
        },
        postalcode_id: {
            type: mongoose.Types.ObjectId,
            ref: 'postalcode'
        },
        country_id: {
            type: mongoose.Types.ObjectId,
            ref: 'country'
        },
        message : {
            type: String,
            default: null
        },
        note:{
            type: String
        },
        status : {
            type: String,            //approved, pending, rejected
            default: 'pending'
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

module.exports = new mongoose.model('partner_request', partnerRequestModelSchema)