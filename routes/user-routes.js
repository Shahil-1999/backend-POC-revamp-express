const express = require('express')
const router = express.Router()
const {
    UserController
} = require('../controller/index')
const {
    UserValidation
} = require('../validations/index')

const authMiddleware = require('../middleware/app.auth')

router.post('/user_login', UserValidation.userLoginValidation, UserController.userLogin)
router.post('/add_user', UserValidation.userAddValidation, UserController.addUser)
router.get('/user_details/:id', authMiddleware(), UserValidation.getUserDetailValidation, UserController.getUserById)
router.get('/user_details_admin/:id', authMiddleware(['ADMIN']), UserValidation.getAllUserValidation, UserController.getAllUser)
router.post('/forget_password', UserValidation.forgetPasswordValidation, UserController.forgetPassword)
router.delete('/delete_user_acct/:userDetailsId', authMiddleware(), UserValidation.userAccountDeleteValidation, UserController.deleteAccount)
router.patch('/reset_password/:userDetailsId/:token', UserValidation.resetPasswordValidation, UserController.resetPassword)


module.exports = router;
