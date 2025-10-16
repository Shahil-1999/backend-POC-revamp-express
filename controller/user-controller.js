const SECRET_KEY = process.env.SECRET_KEY;
const commonFunction = require("../common/app.commonFunction");
const {
  UserDetails,
  Subscriptions,
  Posts,
  Comments,
  Files,
} = require("../models/index");
const { sendMailForResetPassword } = require("../helper/mail-helper");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const randomString = require("randomstring");
const { callAgent } = require("../helper/openai");

async function askAgent (req, res){
  try {
    const { prompt } = req.body;   

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await callAgent(prompt);

    return res.json({ success: true, response: result });
  } catch (error) {
    console.error("Agent API error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

async function addUser(req, res) {
  try {
    let { password, name, email, phone_number, gender, role } = req.body;

    const isUserExist = await commonFunction.isUserExist(req);

    if (isUserExist) {
      return res.json({
        status: false,
        msg: "user already exist",
      });
    } else {
      password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      const user = await UserDetails.create({
        name,
        email,
        password,
        phone_number,
        gender,
        role,
      });
      const startDate = moment().toISOString("YYYY-MM-DDTHH:mm:ss");
      const endDate = moment(startDate)
        .add(parseInt(1), "days")
        .toISOString("YYYY-MM-DDTHH:mm:ss");
      await Subscriptions.create({
        price: 0,
        startDate,
        endDate,
        userDetailsId: user.id,
      });

      return res.json({
        status: true,
        msg: "user add sucessfully",
        data: { user },
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

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
        { where: { id: subscription.id } }
      );

      return res.json({
        status: false,
        status_code: 400,
        message: "Your subscription has expired. Please renew to continue.",
      });
    }
    // === Subscription check ends here ===

    // Generate token if everything is good
    const token = jwt.sign(
      {
        id: isUserExist.id,
        user_email: isUserExist.email,
        scope: isUserExist.role,
      },
      SECRET_KEY,
      {
        expiresIn: "1d", // 1 day
      }
    );

    return res.json({
      status: true,
      message: "User logged in and token generated successfully",
      data: {
        userName: isUserExist.name,
        token,
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

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const credentials = req.auth;

    if (credentials.id !== +id) {
      return res.json({
        status: false,
        msg: "Unauthorized Access",
      });
    }

    const user_data = await UserDetails.findOne({
      where: {
        id,
        is_deleted: false,
      },
      raw: true,
    });

    if (!user_data) {
      return res.json({
        status: false,
        message: "user dosent exist",
      });
    } else {
      return res.json({
        status: true,
        message: "user data fetch sucessfully",
        data: user_data,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function getAllUser(req, res) {
  try {
    const { id } = req.params;
    const credentials = req.auth;

    if (credentials.id !== +id) {
      return res.json({
        status: false,
        msg: "Unauthorized Access",
      });
    }

    const user_data = await UserDetails.findOne({
      where: {
        id,
        is_deleted: false,
      },
      attributes: ["id"],
      raw: true,
    });
    if (!user_data) {
      return res.json({
        status: false,
        message: "No user exist",
      });
    } else {
      const getAllData = await UserDetails.findAll({
        where: {
          is_deleted: false,
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },

        raw: true,
      });
      return res.json({
        status: true,
        message: "user data fetch sucessfully",
        data: getAllData,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const { userDetailsId } = req.params;
    const credentials = req.auth;

    if (credentials.id !== +userDetailsId) {
      return res.json({
        status: false,
        msg: "Unauthorized Access",
      });
    }

    const isUserExist = await UserDetails.findOne({
      where: {
        id: userDetailsId,
        is_deleted: false,
      },
      attributes: ["id", "is_deleted"],
      raw: true,
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user not exist",
      });
    } else {
      await UserDetails.update(
        { is_deleted: true },
        { where: { id: userDetailsId, is_deleted: false } }
      );

      await Posts.update(
        { is_deleted: true },
        { where: { userDetailsId, is_deleted: false } }
      );

      await Comments.update(
        { is_deleted: true },
        { where: { userDetailsId, is_deleted: false } }
      );

      await Files.update(
        { is_deleted: true },
        { where: { userDetailsId, is_deleted: false } }
      );
      await Subscriptions.update(
        {
          is_deleted: true,
        },
        {
          where: {
            userDetailsId,
            is_deleted: false,
          },
        }
      );

      return res.json({
        status: true,
        message: "account deleted successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function forgetPassword(req, res) {
  try {
    const { email } = req.body;

    const isUserExist = await UserDetails.findOne({
      where: {
        email,
        is_deleted: false,
      },
      raw: true,
    });
    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist",
      });
    } else {
      const randomstring = randomString.generate();
      await UserDetails.update(
        { token: randomstring },
        {
          where: {
            email,
            is_deleted: false
          },
        }
      );

      await sendMailForResetPassword(isUserExist.id, isUserExist.name, isUserExist.email, randomstring);
      return res.json({
        status: true,
        msg: "Mail has been sent please check your email",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { userDetailsId } = req.params;
    let {token} = req.params;
    let { password } = req.body;
    

    let tokenVerification = await UserDetails.findOne({
      where: {
        id: userDetailsId,
        is_deleted: false,
        token,
      },
      attributes: ["id", "token", "is_deleted"],
      raw: true,
    });

    if (tokenVerification == null || !token) {
      return res.json({
        status: false,
        msg: "Token Expired",
      });
    } else {
      password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      await UserDetails.update(
        {
          password,
          token: "",
        },{
        where: {
          id: userDetailsId,
          is_deleted: false,
        },
      }      );
      return res.json({
        status: true,
        msg: "Password Reset Sucessfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function subscriptionRenew(req, res) {
  const {email, secretSubscriptionCode} = req.body
  try {

    const isUserExist = await UserDetails.findOne({
      where: {
        email,
        is_deleted: false
      },
      attributes: ['id', 'email'],
      raw: true
    })
      if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist",
      });
    } else {
        // === Subscription renew implementation starts here ===
        const isSubscriptionInactive = await Subscriptions.findOne({
          where: {
            userDetailsId: isUserExist.id,
            status: "inactive",
          },
          attributes:['id', 'startdate', 'endDate', 'status'],
          raw: true,
        });
          if (!isSubscriptionInactive) {
            return res.json({
              status: false,
              message: "No inactive subscription found for this user.",
            });
          }
        // === Subscription check ends here ===

        // === Subscription Renew starts here ===
        const code = process.env.SUBSCRIPTION_RENEW_CODE        
        const newEndDate = moment().add(1, "days").toISOString("YYYY-MM-DDTHH:mm:ss");

        if(secretSubscriptionCode !== code) {
          return res.json({
          status: false,
          status_code: 400,
          message: "Please provide valid code to renew the subscription.",
          });
        }
        await Subscriptions.update(
          {
            status: 'active',
            endDate: newEndDate
          },{
            where: {
              userDetailsId: isUserExist.id,
              status: "inactive",
            }
          }
        )
        return res.json({
          status: true,
          message: "Subscription renewed successfully",
          data: {
            userName: isUserExist.name,
            subscription_status: 'active',
            subscription_endDate: newEndDate,
          },
    });
      }
  } catch (error){
     console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

module.exports = {
  addUser,
  userLogin,
  getUserById,
  getAllUser,
  deleteAccount,
  forgetPassword,
  resetPassword,
  askAgent,
  subscriptionRenew,
};
