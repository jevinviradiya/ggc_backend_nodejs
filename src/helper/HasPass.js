const bcrypt = require('bcryptjs')

 const saltRounds = 10
const HasPass=(pass)=>{
    return new Promise((resolve,reject)=>{
        bcrypt.genSalt(saltRounds, function (saltError, salt) {
            if (saltError) {
                reject(saltError)
            } else {
              bcrypt.hash(pass, salt, function(hashError, hash) {
                if (hashError) {
                    reject(hashError)
                } else {
                    resolve(hash)
                }
              })
            }
          })
    })
 
}


module.exports = { HasPass }