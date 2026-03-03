const {rateLimit} = require('express-rate-limit');
const limiter = rateLimit({
    windowMs:  20000, // 20 seconds
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again after 20 seconds',
    statusCode: 429,
});
module.exports = limiter;