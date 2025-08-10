const { getObjectImage, uploadObjectImage } = require("../helper/s3-helper");
const { UserDetails, Posts, Comments, Files } = require("../models/index");

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
    const credentials  = req.auth;

    const getImageKey = await Files.findOne({
      where: {
        userDetailsId: credentials.id,
        is_deleted: false,
      },
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
    const  credentials = req.auth;

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
    filename = `profile-${credentials.id}.${extension}`;

    const { uploadUrl, fileLink } = await uploadObjectImage(filename);
    let savedFile;

    if (isUserExist && !isUserFileExist) {
      savedFile = await Files.create({
          filename,
          fileLink, // store full URL in DB
          user_name: isUserExist.name,
          userDetailsId: credentials.id,
      });
    } else {
      savedFile = await Files.update({
        where: {
          userDetailsId: isUserExist.id, // Use the unique ID
        },
        data: {
          filename,
          fileLink,
        },
      });
    }

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

async function readAllFile(req, res) {
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

    if (!isUserExist) {
      return res.json({
        status: false,
        msg: "User does not exist",
        data: {},
      });
    }

    const files = await Files.findAll({
      where: {
        is_deleted: false,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      raw: true,
    });

    if (files.length === 0) {
      return res.json({
        status: false,
        msg: "File not found",
      });
    }

    return res.json({
      status: true,
      msg: "Files fetched successfully",
      data: files.map((file) => ({
        fileName: file.filename,
        fileData: file.fileData,
        userDetailsId: file.userDetailsId,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: false,
      msg: "An error occurred",
      error: error.message,
    });
  }
}

module.exports = {
  getProfileImage,
  getProfileImageKey,
  uploadProfileImage,
  readAllFile,
};
