const { RefreshToken } = require("../models/index");
const { hashToken } = require("../helper/refresh-token-helper");
const tokenService = require("../service/token-service");
const crypto = require("crypto");

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // Verify JWT
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    // Find token in DB
    const storedRefreshToken = await RefreshToken.findOne({
      where: {
        userDetailsId: decoded.id,
        token_id: decoded.tokenId,
        revoked: false,
      },
    });

    if (!storedRefreshToken) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    // Expiry check
    if (new Date() > new Date(storedRefreshToken.expires_at)) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    //  Hash compare
    if (storedRefreshToken.token_hash !== hashToken(refreshToken)) {
      return res.status(401).json({ message: "Token mismatch detected" });
    }

    // Rotate refresh token
    const newRefreshTokenId = crypto.randomUUID();;

    const newRefreshToken = tokenService.generateRefreshToken({
      id: decoded.id,
      tokenId: newRefreshTokenId,
    });

    await storedRefreshToken.update({
      token_hash: hashToken(newRefreshToken),
      token_id: newRefreshTokenId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Generate new access token
    const accessToken = tokenService.generateAccessToken({
      id: decoded.id,
      scope: decoded.scope,
    });

    // Set cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (error) {
     console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
};

module.exports = {
  refresh,
};