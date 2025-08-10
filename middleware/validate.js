// middleware/validate.js
const validate = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      console.log(
        `Error occurred in: ${error.details[0].context.label}\nError description: ${error.details[0].message}`
      );
      return res.status(400).json({
        status: false,
        message: error.details.map((err) => err.message),
      });
    }
    next();
  };
};

module.exports = validate;
