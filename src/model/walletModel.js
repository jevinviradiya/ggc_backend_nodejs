const mongoose = require('../config/dbConnection');

const walletSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        // required: true
    },
    balance: {
        type: Number,
        default: 0
        // required: true
    },

    is_active: {
        type: String,
        default: true
    },
    is_deleted: {
        type: String,
        default: true
    }

},
    {
        timestams: true
    }
);

module.exports = mongoose.model('wallet', walletSchema);
