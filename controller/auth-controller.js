const commonFunction = require("../common/app.commonFunction");
const { Subscriptions, RefreshToken } = require("../models/index");
const { hashToken } = require("../helper/refresh-token-helper");
const bcrypt = require("bcryptjs");
const tokenService = require("../service/token-service");
const crypto = require("crypto");
const redis = require("../config/redis-config");

async function userLogin(req, res) {
  try {
    const { password } = req.body;
    const isUserExist = await commonFunction.isUserExist(req);

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "User doesn't exist",
      });
    }

    const hashPassword = isUserExist.password;
    if (!bcrypt.compareSync(password, hashPassword)) {
      return res.json({
        status: false,
        message: "Password not matched",
      });
    }

    // === Subscription check implementation starts here ===
    const subscription = await Subscriptions.findOne({
      where: {
        userDetailsId: isUserExist.id,
        status: "active",
      },
      raw: true,
    });

    if (!subscription) {
      return res.json({
        status: false,
        status_code: 400,
        message: "No active subscription found. Please subscribe to continue.",
      });
    }

    // Check expiry
    if (new Date() > new Date(subscription.endDate)) {
      // Immediately deactivate expired subscription
      await Subscriptions.update(
        { status: "inactive" },
        { where: { id: subscription.id } },
      );

      return res.json({
        status: false,
        status_code: 400,
        message: "Your subscription has expired. Please renew to continue.",
      });
    }
    // === Subscription check ends here ===

    // Generate access token if everything is good
    const accessToken = tokenService.generateAccessToken({
      id: isUserExist.id,
      email: isUserExist.email,
      scope: isUserExist.role,
    });

    // After generating accessToken
    await redis.set(
      `access:${accessToken}`, // key
      isUserExist.id,          // value (or anything meaningful)
      "EX",
      15 * 60                  // expire in 15 mins
    );

    const tokenId = crypto.randomUUID();
    const refreshToken = tokenService.generateRefreshToken({
      id: isUserExist.id,
      tokenId,
    });

    // Store refresh token in DB (HASHED)
    await RefreshToken.create({
      userDetailsId: isUserExist.id,
      token_hash: hashToken(refreshToken),
      token_id: tokenId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Saving refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      status: true,
      message: "User logged in and token generated successfully",
      data: {
        userName: isUserExist.name,
        token: accessToken,
        userDetailsId: isUserExist.id,
        role: isUserExist.role,
        subscription_status: subscription.status,
        subscription_endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      msg: "error",
      error,
    });
  }
}

async function userLogout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      await RefreshToken.update(
        { revoked: true },
        {
          where: {
            userDetailsId: decoded.id,
            token_id: decoded.tokenId,
          },
        },
      );
    }

    res.clearCookie("refreshToken");

    //Remove access token from Redis (immediate invalidation)
    const accessToken = req.accessToken; // from middleware
    if (accessToken) {
      await redis.del(`access:${accessToken}`);
    }

    return res.json({
      status: true,
      status_code: 200,
      message: "Logged out successfully and access token invalidated",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      status_code: 500,
      message: "Logout failed",
      error: error.message || error,
    });
  }
}


module.exports = {
  userLogin,
  userLogout,
}