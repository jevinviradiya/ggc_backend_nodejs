const mongoose = require('../config/dbConnection');

const tokenSchema = new mongoose.Schema({
    
    user_id : {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    device_id : {
      type : String,
      default: null
    },
    token : {
    type: String,
    default:null
  },
  active : {
    type:String,
    default: true
  },

  expire_at: {type: Date, expires: '2d' },
},
{
  timestams: true
}
);

module.exports = mongoose.model('token', tokenSchema);
