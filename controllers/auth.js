const User = require("../models/Users")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const ErrorResponse = require("../utils/errorResponse")
const sendEmail = require("../utils/sendEmail")

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        if(! username || ! email || !password)
        return next(new ErrorResponse("All Fields Are Required", 400))
        const usermail = await User.findOne({email})
        if(usermail) 
        return next(new ErrorResponse("Email Already Exists", 400))
        const usersname = await User.findOne({username})
        if(usersname) 
            return next(new ErrorResponse("Username Already Taken", 400))
        const user = await User.create({
            username, email, password
        })
        sendToken(user, 200, res);
    } catch (error) {
        return next(error)
    }
}
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password)
        return next(new ErrorResponse("Fields Cannot be Blank", 400))
        const usersMail = await User.findOne({email}).select("password")     //+password
        // console.log(usersMail)
        if(!usersMail) 
        return next(new ErrorResponse("Invalid Credentials", 401))
        const isMatch = await usersMail.matchPasswords(password)
        if(!isMatch)
        return next(new ErrorResponse("Invalid Credentials", 401))
        // const usersPass = await bcrypt.compare(password, usersMail.password);
        // if(!usersPass)
        //     return res.status(400).json({msg: "Password Did Not Match"})
        sendToken(usersMail, 200, res)
    } catch (error) {
        return res.status(500).json({success: false, error: error.message })
    }
}
exports.forgotpassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const findMail = await User.findOne({email})
        if(!findMail)
            return next(new ErrorResponse("Mail Could Not Sent", 404))
        const resetToken = findMail.getResetPasswordToken()
        await findMail.save();
        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`
        const message = `
        <h1>You have requested for Password Reset</h1>
        <p>Please go to the given link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `
        try {
            await sendEmail({to: findMail.email, subject: "Password Reset Mail", text: message})
            return res.status(200).json({success: true, data: "password reset Email Sent to your email: "+findMail.email})           
        } catch (error) {
            findMail.resetPasswordToken = undefined;
            findMail.resetPasswordExpire = undefined;
            await findMail.save()
            return next(new ErrorResponse("Email Could not be sent", 500))
        }
    } catch (error) {
        return next(error)
    }
    
}
exports.resetpassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex")
    try {
        const user = await User.findOne({resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}})
        if(!user)
            return next(new ErrorResponse("Invalid Reset Token", 400))
        user.password = req.body.password
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.seave();
        res.status(200).json({success: true, data: "password reset successs"})
    } catch (error) {
        next(error)
    }
}
// token function
const sendToken = (user, statusCode, res) =>{
    const token = user.getSignedtoken()
    res.status(statusCode).json({success: true, token})
}
