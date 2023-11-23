const mongoose = require('../config/dbConnection')

const paymentSchema = new mongoose.Schema({

    request_id: {
        type : mongoose.Types.ObjectId,
        ref: 'partner_request'
    },
    created_by: {
        type : mongoose.Types.ObjectId,
        ref: 'user'
    },
    payment_by: {
        type : String,
        default : 'Cash',    // payment by cash / cheque / netbanking / UPI
        required: true
    },
    cheque_number: {
        type: Number,
    },
    cheque_date: {
        type: Date,
    },
    account_holder_name: {
        type: String,
    },
    account_holder_bank: {
        type: String,
    },
    bank_branch: {
        type: String,
    },
    upi: {
        type: String
    },
    amount:{
        type: Number,
        default: null
    },
    currency:{
        type: String,
        default: 'INR'      //payment currency :- INR, USD, EUR, etc....
    },
    status:{
        type: String,
        default: 'pending'      //payment status :- done , pending
    },
    // payment_date:{
    //     type: Date     
    // },
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

module.exports = new mongoose.model('payment', paymentSchema)
