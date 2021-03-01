const nodemailer = require("nodemailer");

const sendEmail = (options) => {
    const tranporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth:{
            type:OAuth2,
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
            clientId: process.env.CLIENT_ID,
            clientSecret:process.env.CLIENT_SECRET,
            refreshToken:process.env.REFRESH_TOKEN,
            accessToken:process.env.ACCESS_TOKEN
        }
    })

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.text
    }

    tranporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err)
        }else{
            console.log(info)
        }
    })
}

module.exports = sendEmail;