const mongoose = require('../config/dbConnection')

const adminModelSchema = new mongoose.Schema(
    {
        mobile_number : {
            type: Number,
        },
        password: {
            type:String,
            default:null
        },
        email : {
            type: String,
            default:null
        },
        profile_picture : {
            type: String,
            default: process.env.DEFAULT_USER_PROFILE_PICTURE
        },
        role_id : {
            type: mongoose.Types.ObjectId,
            ref: 'role'    //Community member, Community creator, Community head, Community super admin
        },
        verified_admin : {
            type: String,
            default: false       
         },
         last_logIn : {
            type: Date,
            default:null
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

module.exports = new mongoose.model('admin', adminModelSchema)