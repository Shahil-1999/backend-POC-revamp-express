const { UserDetails, Posts, Comments } = require("../models/index");

async function addPost(req, res) {
  try {
    const { userDetailsId, title, post_description } = req.body;
    const credentials = req.auth;

    if (credentials.id !== +userDetailsId) {
      return res.json({
        status: false,
        msg: "Unauthorized Access",
      });
    }

    let isUserExist = await UserDetails.findOne({
      where: {
        id: userDetailsId,
        is_deleted: false,
      },
      raw: true,
    });    

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist ",
      });
    } else {
      const posts = await Posts.create({
        title,
        user_name: isUserExist.name,
        post_description,
        userDetailsId,
      });

      return res.json({
        status: true,
        msg: "posts added sucessfully",
        data: { posts },
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

async function readAllPost(req, res) {
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
      attributes: ["id"],
      raw: true,
    });

    if (isUserExist) {
      const readAllPosts = await Posts.findAll({
        where: {
          is_deleted: false,
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: [
          {
            model: Comments,
            where: {
              is_deleted: false,
            }, // Optional: only non-deleted comments
            attributes: { exclude: ["createdAt", "updatedAt"] },
            required: false, // Include posts even if no comments
          },
        ],
      });

      return res.json({
        status: true,
        message: "all posts fetched successfully",
        data: { readAllPosts },
      });
    } else {
      return res.json({
        status: false,
        msg: "User doesn't exist",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error.message || error,
    });
  }
}

async function editPost(req, res) {
  try {
    const { userDetailsId, postId } = req.params;
    const { title, post_description } = req.body;
    const credentials  = req.auth;

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
      attributes: ["id"],
      raw: true,
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist ",
      });
    } else {
      const postExist = await Posts.findOne({
        where: {
          id: postId,
          is_deleted: false,
        },
        raw: true,
      });

      if (postExist) {
        const post = await Posts.update(
          {
            title,
            post_description,
          },
          {
            where: {
              id: postId,
              is_deleted: false,
            },
          }
        );

        return res.json({
          status: true,
          msg: "posts added sucessfully",
          data: { post },
        });
      } else {
        return res.json({
          status: false,
          msg: "posts doesnt exist",
          data: {},
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function readOwnPost(req, res) {
  try {
    const { userDetailsId } = req.params;
    const credentials  = req.auth;

    if (credentials.id !== +userDetailsId) {
      return res.json({
        status: false,
        msg: "Please Check Your UserDetailsId (token's id and UserDetailsId is mismatched)",
      });
    }

    const readOwnPosts = await Posts.findAll({
      where: {
        userDetailsId,
        is_deleted: false,
      },

      include: [
        {
          model: Comments,
          where: {
            is_deleted: false,
          }, // Optional: only non-deleted comments
          attributes: { exclude: ["createdAt", "updatedAt"] },
          required: false, // Include posts even if no comments
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    return res.json({
      status: true,
      message: "post Fetch sucessfully",
      data: { readOwnPosts },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function deletePost(req, res) {
  try {
    const { userDetailsId, postId } = req.params;
    const credentials = req.auth;

    if (credentials.id !== +userDetailsId) {
      return res.json({
        status: false,
        msg: "Please Check Your UserDetailsId (token's id and UserDetailsId is mismatched)",
      });
    }

    const isUserExist = await UserDetails.findOne({
      where: {
        id: userDetailsId,
        is_deleted: false,
      },
      attributes: ["id"],
      raw: true,
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist ",
      });
    }

    const isPostExist = await Posts.findOne({
      where: {
        id: postId,
        is_deleted: false,
      },
      attributes: ["id"],
      raw: true,
    });

    if (!isPostExist) {
      return res.json({
        status: false,
        msg: "post dosent exist",
      });
    }

    // Soft delete the post
    const post = await Posts.update(
      { is_deleted: true },
      {
        where: {
          id: postId,
        },
      }
    );

    // Soft delete all comments related to the post
    const postCommentsDelete = await Comments.update(
      { is_deleted: true },
      {
        where: {
          postID: postId,
          is_deleted: false,
        },
      }
    );

    return res.json({
      status: true,
      message: "post deleted sucessfully",
      data: post,
      postCommentsDelete,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

module.exports = {
  addPost,
  readAllPost,
  editPost,
  readOwnPost,
  deletePost,
};
