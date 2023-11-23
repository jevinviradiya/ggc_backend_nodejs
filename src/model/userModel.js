const mongoose = require('../config/dbConnection')


const userModelSchema = new mongoose.Schema(
    {
        created_by: {                             
            type: mongoose.Types.ObjectId,
            refPath: 'user'
        },
        first_name : {
            type: String,
            default: null
        },
        last_name : {
            type: String,
            default: null
        },
        birth_date : {
            type: Date,
            default: null
        },
        address : {
            type: String,
            default: null
        },
        city_id: {
            type: mongoose.Types.ObjectId,
            ref: 'city',
            default: '63173a764bb0e9240f0e82b4'
        },
        state_id: {
            type: mongoose.Types.ObjectId,
            ref: 'state',
            default: '63173981642bf8cd22080245'
        },
        postalcode_id: {
            type: mongoose.Types.ObjectId,
            ref: 'postalcode',
            default: '380015',
            default: '653a0e255b13e8656690717d'
        },
        country_id: {
            type: mongoose.Types.ObjectId,
            ref: 'country',
            default: '6317381b88687d12d50937b3'
        },
        gender : {
            type: String,
            default: null
        },
        email : {
            type: String,
            default: null
        },
        phone_code : {
            type: Number,
            default: 91
        },
        mobile_number : {
            type: Number,
            default: null
        },
        role_id : {
            type: mongoose.Types.ObjectId,
            ref: 'role' ,                  //Community member, Community creator, Community head, Community super admin
            default: '651d62bee3973126639c6fee'
        },
        refferal_code: {
            type: Number
        },
        chapterId_refferalType : {
            type: mongoose.Types.ObjectId,
            ref: 'chapter',
            default: null
        },
        profile_picture : {
            type: String,
            default: process.env.DEFAULT_USER_PROFILE_PICTURE
        },
        password: {
            type:String,
            default:null
        },
        gst_number: {
            type:String,
        },
        pan_number: {
            type:String,
        },
        company_name: {
            type:String,
        },
        business_id : {
            type: String,
            // default: null
        },
        membership_id : {
            type: String,
            default: null
        },
        
        wallet_id : {
            type: mongoose.Types.ObjectId,
            ref: 'wallet',
        },
        generated_qr_code : {
            type: String,
            default:null
        },
        social_id : {
            type: Array,
            default: []
        },
        verified_user : {
            type: String,
            default: false       
        },
         last_logIn : {
            type: Date,
            default:null
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

module.exports = new mongoose.model('user', userModelSchema)