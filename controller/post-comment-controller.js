const {
  UserDetails,
  Posts,
  Comments,
} = require("../models/index");
require('dotenv').config()

async function addCommentsOnAnyPost(req, res) {
  try {
    const { userDetailsId, postID, comments } = req.body;
    const  credentials = req.auth;

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
      raw: true,
      attributes: ['id', 'name']
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist ",
      });
    }

    const isPostExist = await Posts.findOne({
      where: {
        id: postID,
        is_deleted: false,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      raw: true
    });

    if (!isPostExist) {
      return res.json({
        status: false,
        msg: "post dosent exist ",
      });
    }

    // Add user_name to body
    user_name = isUserExist.name;

    const comment = await Comments.create({
        comments,
        postID,
        userDetailsId: isUserExist.id,
        user_name,
    });

      return res.json({
        status: true,
        msg: "Comments add sucessfully",
        data: comment,
      });
    
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function readCommentsOnPost(req, res) {
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
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      raw: true,
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist ",
      });
    }

    const comments_on_post = await Comments.findAll({
      where: {
        userDetailsId: +userDetailsId,
        is_deleted: false,
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: Posts,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          raw: true,
        },
        {
          model: UserDetails,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          raw: true,
        },
      ],
      raw: true,
      nest: true,
    });

    return res.json({
      status: true,
      message: "all comments fetch sucessfully",
      data: { comments_on_post },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function editOwnComments(req, res) {
  try {
    const { userDetailsId, postId, commentsId } = req.params;
    const {comments } = req.body;
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
        is_deleted: false 
    },
      attributes: ['id'],
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
        is_deleted: false 
    },
      attributes:['id'],
      raw: true,
    });

    if (!isPostExist) {
      return res.json({
        status: false,
        msg: "Post not exist",
      });
    }

    const isCommentExist = await Comments.findOne({
      where: { 
        id: commentsId, 
        is_deleted: false 
    },
      attributes:['id'],
      raw: true,
    });

    if (!isCommentExist) {
      return res.json({
        status: false,
        msg: "Comment not exist",
      });
    }

    // Update comment
    await Comments.update(
  { comments }, // values to update
  {
    where: {
      id: commentsId,
      is_deleted: false,
    },
  }
);


    // Fetch updated comment
    const updatedComment = await Comments.findOne({
      where: { 
        id: commentsId 
    },
      attributes: ['id'],
      raw: true,
    });

    if (updatedComment.userDetailsId !== +userDetailsId) {
      return res.json({
        status: true,
        msg: "This User is not authorized to edit this comment",
        data: {},
      });
    }

      return res.json({
        status: true,
        msg: "Comment Updated",
        data: { comment: updatedComment },
      });
    
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function deleteOwnPostComment(req, res) {
  try {
    const { userDetailsId, commentsId } = req.params;
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
        is_deleted: false 
    },
      attributes: ['id'],
      raw: true,
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist",
      });
    }

    const isCommentExist = await Comments.findOne({
      where: { 
        id: commentsId, 
        is_deleted: false 
    },
      attributes: ['id'],
      raw: true,
    });

    if (!isCommentExist) {
      return res.json({
        status: false,
        msg: "comments dosent exist ",
      });
    }

    const comments = await Comments.update(
      { is_deleted: true },
      {
        where: { 
            id: commentsId 
        },
      }
    );

   
      return res.json({
        status: true,
        message: 'comment deleted sucessfully',
        data: comments,  // Note: comments here is number of affected rows or an array depending on your DB and Sequelize version
      });
    
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function deleteOwnCommentsInAnyPost(req, res) {
  try {
    const { userDetailsId, commentsId } = req.params;
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
      attributes: ['id'],
      raw: true,
    });

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "user dosent exist",
      });
    }

    const isCommentExist = await Comments.findOne({
      where: {
        id: commentsId,
        userDetailsId,
        is_deleted: false,
      },
      attributes: ['id', 'userDetailsId'],
      raw: true,
    });

    if (!isCommentExist) {
      return res.json({
        status: false,
        msg: "you are not authorized to delete this comment ",
      });
    }

    // Soft delete the comment
    const comments = await Comments.update(
      { 
        is_deleted: true
    },
      { 
        where: { 
            id: commentsId 
        } 
    }
    );


      return res.json({
        status: true,
        message: 'comment deleted sucessfully',
        data: comments, // this will be number of affected rows or array depending on Sequelize version
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
    addCommentsOnAnyPost,
    readCommentsOnPost,
    deleteOwnPostComment,
    editOwnComments,
    deleteOwnCommentsInAnyPost
}