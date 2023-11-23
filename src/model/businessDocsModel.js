const mongoose = require('../config/dbConnection')

const businessDocsModelSchema = new mongoose.Schema(
    {
        user_id : {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            // require: true
        },
        business_id : {
            type: mongoose.Types.ObjectId,
            ref: 'user_business',
            require: true
        },
        document_type: {
            type: String,
            enum: ['GST', 'PAN'] 

        },
        business_document: {
            type: String,
            default:process.env.DEFAULT_BUSINESS_DOC
        },
        approved_by:{                             
            type: mongoose.Types.ObjectId,
            ref: 'user'
        },
        status: {
            type: String,
            default : 'pending'     // approved, rejected
        },
        approved_at:{                             
            type: Date,
            default:null
        },
        is_verified : {
            type: Boolean,
            default: false
        },
        is_deleted : {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

module.exports = new mongoose.model('user_business_docs', businessDocsModelSchema)