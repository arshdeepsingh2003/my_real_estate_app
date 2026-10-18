export const errorHandler=(statusCode,message)=>{
    const error=new Error()
    error.statusCode=statusCode;
    error.message=message;
    error.isOperational=true;
    return error;
}