const mongoose = require('../config/dbConnection');

const transactionSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        // required: true
    },
    opening_balance: {
        type: Number,
        default: 0.00
        // required: true
    },
    closing_balance: {
        type: Number,
        default: 0.00
        // required: true
    },
    amount: {
        type: Number,
        // default: 0.00
        // required: true
    },
    transaction_status: {
        type: String,
        // default: true
    },
    success_status: {
        type: String,
        // default: true
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
        timestamps: true
    }
);

module.exports = mongoose.model('transaction', transactionSchema);
