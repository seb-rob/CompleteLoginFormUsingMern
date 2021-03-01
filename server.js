require("dotenv").config({path: "./config.env"})
const express = require("express");
const errorHandler = require("./middleware/error")

const connectdb = require("./config/db");

//database
connectdb();

const app = express();
app.use(express.json());

app.use("/api/auth", require("./routes/auth"))
app.use("/api/private", require("./routes/private"))

//error handler should be the last piece of middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})

// don't want our server to crash every time any error occured
process.on("unHandleRejection", (err, promise) => {
    console.log(`Logged Error ${err}`)
    server.close(()=> process.exit(1))              //closes the server
})