const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt-config');

function generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.accessToken.secret, {
        expiresIn: jwtConfig.accessToken.expiresIn
    });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.refreshToken.secret, {
        expiresIn: jwtConfig.refreshToken.expiresIn
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, jwtConfig.accessToken.secret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, jwtConfig.refreshToken.secret);
}

function rotateTokens(user) {
    return {
        accessToken: generateAccessToken({
            id: user.id,
            scope: user.scope
        }),
        refreshToken: generateRefreshToken({
            id: user.id
        })
    };
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    rotateTokens
};