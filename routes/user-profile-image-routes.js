const express = require('express')
const router = express.Router()
const {
    UserProfileImageController
} = require('../controller/index')
const {
    UserProfileImageValidations
} = require('../validations/index')

const authMiddleware = require('../middleware/app.auth')

router.post('/profile_img/get', authMiddleware(), UserProfileImageValidations.getProfileImageValidation, UserProfileImageController.getProfileImage)
router.get('/profile_img/key', authMiddleware(), UserProfileImageController.getProfileImageKey)
router.post('/upload-url/:filename', authMiddleware(), UserProfileImageValidations.uploadProfileImageValidation, UserProfileImageController.uploadProfileImage)
router.get('/get_all_profile_image/:userDetailsId', authMiddleware(['ADMIN']), UserProfileImageValidations.getAllImageValidation, UserProfileImageController.readAllFile)
router.delete('/profile_img/delete', authMiddleware(), UserProfileImageController.deleteProfileImage)

module.exports = router;
