const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWSAccessKey,
    secretAccessKey: process.env.AWSSecretKey,
  },
});

async function getObjectImage(key) {
  // const key =
  const command = new GetObjectCommand({
    Bucket: process.env.AWSBucket,
    Key: key,
  });
  const URL = await getSignedUrl(s3Client, command);
  return URL;
}

async function uploadObjectImage(filename, ext) {
  let contentType;
  switch (ext) {
    case "jpg":
    case "jpeg":
      contentType = "image/jpeg";
      break;
    case "png":
      contentType = "image/png";
      break;
    case "gif":
      contentType = "image/gif";
      break;
    default:
      throw new Error("Unsupported file type");
  }

  // Include folder in S3 Key

  const command = new PutObjectCommand({
    Bucket: process.env.AWSBucket,
    Key: filename,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command);

  // Full URL to save in DB
  const fileLink = `https://${process.env.AWSBucket}.s3.ap-south-1.amazonaws.com/${filename}`;

  return {
    uploadUrl,
    filename,
    fileLink,
    contentType,
  };
}

async function listAllProfileImages(prefix) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWSBucket,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);

  if (!response.Contents) return [];

  // Filter out the folder placeholder (prefix itself)
  const filesOnly = response.Contents.filter(
    (item) => item.Key !== `${prefix}/`
  );

  // Mapping each object key to a signed URL
  const signedFiles = await Promise.all(
    filesOnly.map(async (item) => {
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWSBucket,
        Key: item.Key,
      });

      const signedUrl = await getSignedUrl(s3Client, getCommand);

      return {
        key: item.Key,
        url: signedUrl,
      };
    })
  );

  return signedFiles;
}

module.exports = {
  getObjectImage,
  uploadObjectImage,
  listAllProfileImages,
};
