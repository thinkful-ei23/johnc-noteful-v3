const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    fullname:{type: String},
    username:{type: String, required:true, unique:true},
    // passwordHistory:[{type:String}],
    password:{type: String, required:true}
    
});

userSchema.set('toObject', {
    virtuals:true, 
    versionKey:false,
    transform: (doc,ret) =>{
        delete ret._id;
        delete ret.password
    }
});

// userSchema.methods.validatePasswordHistory = function(password){
//     console.log(password)
//     const allPasswordHistory = [...this.passwordHistory,this.password]
//     return Promise.all(allPasswordHistory.map(oldPassword=> bcrypt.compare(password,oldPassword)))
//     .then(results => results.every(isMatch => !isMatch))
//     // return this.passwordHistory.every(oldPassword=>
//     // !bcrypt.compare(password,oldPassword ))
// }

userSchema.methods.validatePassword = function(password){
    return bcrypt.compare(password, this.password)
};
userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);