module.exports = {
    accessToken: {
        secret: process.env.ACCESS_SECRET_KEY,
        expiresIn: '15m'
    },
    refreshToken: {
        secret: process.env.REFRESH_SECRET_KEY,
        expiresIn: '7d'
    }
};