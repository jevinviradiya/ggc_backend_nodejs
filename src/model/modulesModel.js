const mongoose = require('../config/dbConnection');

const moduleSchema = new mongoose.Schema({

    name: {
        type: String,
        required:true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
},
{timestamps : true}
);

module.exports = mongoose.model('modules', moduleSchema);
