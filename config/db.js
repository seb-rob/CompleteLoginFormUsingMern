const mongoose = require("mongoose")
const mongodb = require("mongodb")

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useFindAndModify: true, 
            useCreateIndex: true, 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        })
        console.log("mongodb connected successfully")
    } catch (err) {
        console.log("Something went wrong "+ err);
    }
}

module.exports = connectdb;