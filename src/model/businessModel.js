const mongoose = require('../config/dbConnection')

const businessModelSchema = new mongoose.Schema(
    {
        user_id : {
            type: mongoose.Types.ObjectId,
            ref: 'user',
        },
        chapter_id:{
            type: mongoose.Types.ObjectId,
            ref: 'chapter',
        },
        business_name : {
            type: String,
            // required: true
        },
        owner_firstname : {
            type: String,
            default:null
            // required: true
        },
        owner_lastname : {
            type: String,
            default:null
            // required: true
        },
        business_logo : {
            type: String,
            default: process.env.DEFAULT_USER_PROFILE_PICTURE
        },
        business_email : {
            type: String,
            required:true
        },
        business_contact : {
            type: Number,
            required:true
        },
        establish_year : {
            type: String,
            default: null
            // required: true
        },
        business_catagory_id : {
            type: mongoose.Types.ObjectId,
            ref: 'business_category'
            // required: true
        },
        annual_turnover:{                              // last year annual turn over
            type: Number,              
            default:null
        },
        business_website: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
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
        representative_1 : {
            type: Object,
            // ref:'user'
        },
        representative_2 : {
            type: Object,
            // ref:'user'
        },
        business_card : {
            type: String,
            default:null,
        },
        document_uploaded : {
            type: Boolean,
            default: false
        },
        is_active : {
            type: Boolean,
            default: false
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

module.exports = new mongoose.model('user_business', businessModelSchema)