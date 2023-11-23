const mongoose = require('../config/dbConnection');

const otpSchema = new mongoose.Schema({
    
  mobile_number: {
    type: Number,
    // default: null
    // required: true,
  },
  email: {
    type: String,
    default:null
  },
  otp: {
    type: Number,
    default:null
  },
  date: {
    type: Date,
    default: Date.now,
  },
  otp_expiration_time: {
    type: Date,
    default: Date.now,
  },
  expire_at: {type: Date, default: Date.now, expires: 7200},
});

// Validation for mobile number
otpSchema.path('mobile_number').validate(function validatePhone() {
  return this.mobile_number > 999999999 && this.mobile_number <= 9999999999;
});

module.exports = mongoose.model('otp', otpSchema);
