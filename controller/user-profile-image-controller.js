const { getObjectImage, uploadObjectImage, listAllProfileImages, deleteObjectImage } = require("../helper/s3-helper");
const{sendProfileUploadEmail, sendProfileImageDeleteEmail} = require('../helper/mail-helper')
const { UserDetails, Files } = require("../models/index");
const { where } = require("sequelize");

async function getProfileImage(req, res) {
  try {
    const { key } = req.body;

    if (!key) {
      return res.json({
        status: false,
        message: "key is not provided",
      });
    }
    

    const url = await getObjectImage(key);

    return res.json({
      status: true,
      message: "Signed URL generated successfully",
      data: {
        url,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function getProfileImageKey(req, res) {
  try {
    const credentials = req.auth;

    const getImageKey = await Files.findOne({
      where: {
        userDetailsId: credentials.id,
        is_deleted: false,
      },
      raw: true
    });

    return res.json({
      status: true,
      message: "Signed URL generated successfully",
      data: {
        getImageKey,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function uploadProfileImage(req, res) {
  try {
    let { filename } = req.params;
    const credentials = req.auth;

    const isUserExist = await UserDetails.findOne({
      where: {
        id: credentials.id,
        is_deleted: false,
      },
    });

    const isUserFileExist = await Files.findOne({
      where: {
        userDetailsId: credentials.id,
        is_deleted: false,
      },
    });

    const extension = filename.split(".").pop();
    const folderName = "profile-images";
    filename = `${folderName}/profile-${credentials.id}`;

    const { uploadUrl, fileLink } = await uploadObjectImage(filename, extension);
    let savedFile;

    if (isUserExist && !isUserFileExist) {
      savedFile = await Files.create({
        filename,
        fileLink, // store full URL in DB
        user_name: isUserExist.name,
        userDetailsId: credentials.id,
      });
    } else {
      savedFile = await Files.update(
        {
          filename,
          fileLink,
        },
        {
          where: {
            userDetailsId: isUserExist.id,
          },
        }
      );
    }

    await sendProfileUploadEmail(isUserExist.email, isUserExist.name);


    return res.json({
      status: true,
      message: "Upload URL generated and file metadata saved",
      data: {
        uploadUrl,
        fileRecord: savedFile,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function deleteProfileImage(req, res) {
  try {
    const credentials = req.auth;

    const isUserExist = await UserDetails.findOne({
      where: {
        id: credentials.id,
        is_deleted: false,
      },
    });


    const isUserFileExist = await Files.findOne({
      where: {
        userDetailsId: credentials.id,
        is_deleted: false,
      },
      attributes: ['id', 'filename', 'is_deleted'],
    });

    if (!isUserFileExist) {
      return res.json({
      status: true,
      message: "File not found",
    });
    } 

    await deleteObjectImage(isUserFileExist.filename);


    savedFile = await Files.update({
      is_deleted: true,
      },
      {
      where: {
        id: isUserFileExist.id,
      }
    });

    await sendProfileImageDeleteEmail(isUserExist.email, isUserExist.name);

    return res.json({
      status: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

async function readAllFile(req, res) {
  try {
    const credentials = req.auth;
    const { userDetailsId } = req.params;

    if (credentials.id !== +userDetailsId) {
      return res.json({
        status: false,
        msg: "Unauthorized Access",
      });
    }

    // Get all active users
    const users = await UserDetails.findAll({
      where: { is_deleted: false },
      raw: true,
    });

    if (users.length === 0) {
      return res.json({
        status: false,
        msg: "No users found",
        data: [],
      });
    }

    // Get all profile images from S3
    const prefix = "profile-images";
    const allImages = await listAllProfileImages(prefix);

    // Map images to users (assuming key contains userId like 'profile-images/1.jpg')
    const usersWithImages = users.map(user => {
    const imageObj = allImages.find(img => img.key.includes(`profile-${user.id}`));
      return {
        ...user,
        profileImage: imageObj ? imageObj.url : null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Users with profile images fetched successfully",
      data: usersWithImages,
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
  getProfileImage,
  getProfileImageKey,
  uploadProfileImage,
  readAllFile,
  deleteProfileImage,
  // readAllUserProfileImages,
};
