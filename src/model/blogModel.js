const mongoose = require('../config/dbConnection')

const blogSchema = new mongoose.Schema({

    title: {
        type : String,
        default: null
    },
    description: {
        type : String,
        default: null
    },
    created_by: {
        type : mongoose.Types.ObjectId,
        ref: 'user'  
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
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
);

module.exports = new mongoose.model('blog', blogSchema)
