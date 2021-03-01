const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserModel = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please Provide Username"]
    }, 
    email:{
        type: String,
        required: [true, "Please Provide Email"],
        unique: true,
        match:[
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please Provide Valid Mail Id"
        ]
    }, 
    password:{
        type: String,
        required: [true, "Please Provide Password"],
        minlength: 6,
        select: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})
//for saving in mongo
UserModel.pre("save", async function (next) {
    if(!this.isModified("password")){
        return next();
    } 
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt);  
    next();
})
//mactch password
UserModel.methods.matchPasswords = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//token
UserModel.methods.getSignedtoken = function (){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

//reset password token
UserModel.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex")
    // storing in to User Model's resetPasswordToken property
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    // storing in to User Model's resetPasswordExpire property
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)        // 10 min
    return resetToken;
}

const User = mongoose.model("User", UserModel, "LoginForm");

module.exports = User;
