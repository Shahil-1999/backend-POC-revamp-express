// JWTvalidate.js
const { UserDetails } = require('../models');

const JWTvalidate = async function (decode) {
    try {
        const user = await UserDetails.findOne({
            where: {
                id: decode.id,
                is_deleted: false
            }
        });


        if (!user) {
            return { isValid: false };
        }

        return { 
            isValid: true, 
            credentials: { 
                id: user.id, 
                user: user.user_email,
                scope: user.role  // role attached for middleware
            } 
        };
    } catch (error) {
        console.log("JWT validation error:", error);
        return { isValid: false };
    }
};

module.exports = JWTvalidate;
