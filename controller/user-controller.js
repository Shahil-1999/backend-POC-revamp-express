const SECRET_KEY = process.env.SECRET_KEY;
const commonFunction = require("../common/app.commonFunction");
const {
  UserDetails,
  Subscriptions,
  Posts,
  Comments,
  Files,
} = require("../models/index");
const { sendMail } = require("../helper/mail-helper");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const randomString = require("randomstring");

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
        msg: "user dosent exist",
      });
    } else {
      const hashPassword = isUserExist.password;
      if (bcrypt.compareSync(password, hashPassword)) {
        // === Subscription check implementation starts here ===
        const subscription = await Subscriptions.findOne({
          where: {
            userDetailsId: isUserExist.id,
            status: "active",
          },
          raw: true,
        });

        if (!subscription || new Date() > new Date(subscription.endDate)) {
          return res.json({
            status: false,
            status_code: 400,
            message: "Your subscription has expired. Please renew to continue.",
          });
        }
        // === Subscription check ends here ===

        
        const token = jwt.sign(
          {
            id: isUserExist.id,
            user_email: isUserExist.email,
            scope: isUserExist.role,
          },
          SECRET_KEY,
          {
            expiresIn: "1D",
          }
        );
        return res.json({
          status: true,
          message: "User logged in and token generated Sucessfully",
          data: {
            userName: isUserExist.name,
            token,
            userDetailsId: isUserExist.id,
            role: isUserExist.role,
            subscription_status: subscription.status,
            subscription_endDate: subscription.endDate,
          },
        });
      } else {
        return res.json({
          status: false,
          message: "Password not matched",
        });
      }
    }
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

      await sendMail(isUserExist.email, randomstring);
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
    const credentials = req.auth;
    const { userDetailsId } = req.params;
    let {token} = req.params;
    let { password } = req.body;
    

    if (credentials.id !== +userDetailsId) {
      return res.json({
        status: false,
        msg: "Unauthorized Access",
      });
    }

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

module.exports = {
  addUser,
  userLogin,
  getUserById,
  getAllUser,
  deleteAccount,
  forgetPassword,
  resetPassword,
};
