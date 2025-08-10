// middleware/parseIdParams.js
function parseIdParams(req, res, next) {
  const paramsToConvert = ['id', 'userId', 'postId', 'postID', 'userDetailsId'];

  for (const key of paramsToConvert) {
    if (req.params && req.params[key] !== undefined) {
      const parsed = parseInt(req.params[key], 10);

      if (isNaN(parsed)) {
        return res.status(400).json({ status: false, msg: `Invalid ${key} parameter` });
      }

      req.params[key] = parsed;
    }
  }

  next();
}

module.exports = parseIdParams;
