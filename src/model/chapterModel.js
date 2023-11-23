const mongoose = require('../config/dbConnection')

const chapterModelSchema = new mongoose.Schema(
    {
        chapter_name : {
            type: String,
            default: null,
            required: true
        },
        country_id : {
            type: mongoose.Types.ObjectId,
            ref: 'country',
            required: true
        },
        state_id : {
            type: mongoose.Types.ObjectId,
            ref: 'state',
            required: true
        },
        city_id : {
            type: mongoose.Types.ObjectId,
            ref: 'city',
            required: true
        },
        postalcode_id : {
            type: mongoose.Types.ObjectId,
            ref: 'postalcode',
            required: true
        },
        chapter_image : {
            type: String,
            default : process.env.DEFAULT_EVENT_PICTURE
        },
        refferal_code: {
            type : Number
        },
        members : {
            type: Array,       
            default: []
        },
        chapter_desc : {
            type: String,
            default: null
        },
        approved_by:{                             
            type: mongoose.Types.ObjectId,
            refPath: 'approved_by_collection'
        },
        approved_by_collection: {
            type: String,
            enum: ['user', 'admin'] 
          },
        approved_at:{                             
            type: Date,
            default:null
        },
        created_by:{                             
            type: mongoose.Types.ObjectId,
            refPath: 'created_by_collection'
        },
        created_by_collection: {
            type: String,
            enum: ['user', 'admin'] 
          },
        status: {
            type: String, 
            default: 'pending'       //pending, approved, rejected
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

module.exports = new mongoose.model('chapter', chapterModelSchema)