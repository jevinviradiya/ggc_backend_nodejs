require('dotenv').config();
const mongoose = require('mongoose');
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};


mongoose.connect(process.env.DATABASE_URL, connectionOptions).then(()=>console.log("Database Connected")).catch((error)=>{
    console.log(error.message);
});

module.exports = mongoose;
