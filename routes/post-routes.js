const express = require('express')
const router = express.Router()
const {
    PostController
} = require('../controller/index')
const {
    PostValidations
} = require('../validations/index')

const authMiddleware = require('../middleware/app.auth')

router.put('/edit_own_post/:userDetailsId/:postId', authMiddleware(), PostValidations.editpostValidation, PostController.editPost)

router.get('/read_own_post/:userDetailsId', authMiddleware(), PostValidations.getOwnPostValidation, PostController.readOwnPost)

router.post('/add_post', authMiddleware(), PostValidations.addPostValidation, PostController.addPost)

router.get('/read_all_post/:userDetailsId', authMiddleware(), PostValidations.getAllPostValidation, PostController.readAllPost)

router.delete('/delete_post/:userDetailsId/:postId', authMiddleware(), PostValidations.postDeleteValidation, PostController.deletePost)


module.exports = router
