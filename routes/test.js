const express = require('express');
const router = express.Router()
const {
    Test
} = require('../controller/index')
router.get('/test', Test.test)
module.exports = router