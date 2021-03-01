const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) =>{
    let error = {...err};

    error.message = err.message;

    console.log(err + "\n" + "--------------------------------------------------x----------------------------------------------------------")

    if(err.code === 11000){          // in mongoose 11000 means duplicate key value enter 
        const message = "Duplicate key value entered";
        error = new ErrorResponse(message, 400);
    }

    if(err.name === "ValidationError"){
        const message = Object.values(err.errors).map((val) => val.message)
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({error: error.message || "Server Error", success: false})
}

module.exports = errorHandler;