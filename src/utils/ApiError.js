class ApiError extends Error {
    constructor(
        statusCode,
        message="Somenthing went wrong",
        errors = [],
        statck =""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message =message
        this.succses =false;
        this.errors =errors

        if(statck) {
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError }