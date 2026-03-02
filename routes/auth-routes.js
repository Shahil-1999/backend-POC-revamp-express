const express = require('express')
const router = express.Router()
const {
    AuthController,
    RefreshTokenRotationController
} = require('../controller/index')
const {
    UserValidation
} = require('../validations/index')

const authMiddleware = require('../middleware/app.auth')

router.post('/user_login', UserValidation.userLoginValidation, AuthController.userLogin)
router.post('/user_logout', authMiddleware(), AuthController.userLogout)
router.post('/refresh_token', RefreshTokenRotationController.refresh);


module.exports = router;