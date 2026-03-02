async function test(req, res) {
  try {
    console.log("Test route is working");
    return res.json({
      code: 200,
      status: true,
      msg: "Test route is working",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      code: 500,
      msg: error,
      status: false,
    });
  }
}

module.exports = {
  test,
};
