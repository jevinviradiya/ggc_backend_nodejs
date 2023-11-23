const mongoose = require('../config/dbConnection');

const roleSchema = new mongoose.Schema({

    role: {
        type: String,
        default: 'community_member'      //Community member, Community creator, Community head, Community super admin
        // required: true,
    },
    permissions: {
        type : Object,
        default: null
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('role', roleSchema);
