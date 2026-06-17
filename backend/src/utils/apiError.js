


class ApiError extends Error{

    constructor(message = "Internal Server Error", statusCode)
    {
        super(message);
        this.statusCode = statusCode;
    }
}
export default ApiError;