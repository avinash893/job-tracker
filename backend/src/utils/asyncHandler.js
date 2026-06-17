

const asyncHandler = (fn) =>(req,res,next) =>
{
    promise.resolve(fn(req,res,next)).catch(next);
}

export default asyncHandler;