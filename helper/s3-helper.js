const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWSAccessKey,
        secretAccessKey: process.env.AWSSecretKey
    }
})

async function getObjectImage(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWSBucket,
        Key: key
    })
    const URL = await getSignedUrl(s3Client, command)
    return URL
}

async function uploadObjectImage(filename) {
  const ext = filename.split('.').pop().toLowerCase(); 

  let contentType;
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      contentType = 'image/jpeg';
      break;
    case 'png':
      contentType = 'image/png';
      break;
    case 'gif':
      contentType = 'image/gif';
      break;
    default:
      throw new Error('Unsupported file type');
  }



  const fileKey = filename;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWSBucket,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command);

  // full URL to save in DB
  const fileLink = `https://${process.env.AWSBucket}.s3.ap-south-1.amazonaws.com/${fileKey}`;

  return {
    uploadUrl,
    fileKey,
    fileLink,
    contentType
  };
}

module.exports = {
    getObjectImage,
    uploadObjectImage
}