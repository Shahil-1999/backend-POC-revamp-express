const express = require('express')
const router = express.Router()
const {
    PostCommentController
} = require('../controller/index')
const {
    PostCommentValidations
} = require('../validations/index')

const authMiddleware = require('../middleware/app.auth')

router.post('/add_comments_on_any_post', authMiddleware(), PostCommentValidations.addCommentsOnAnyPostValidation, PostCommentController.addCommentsOnAnyPost)

router.get('/get_comments_on_post/:userDetailsId', authMiddleware(), PostCommentValidations.getCommentsOnPostValidation, PostCommentController.readCommentsOnPost)

router.delete('/delete_own_post_comment/:userDetailsId/:commentsId', authMiddleware(), PostCommentValidations.deleteOwnPostCommentsValidation, PostCommentController.deleteOwnPostComment)

router.delete('/delete_own_comments_in_any_post/:userDetailsId/:commentsId', authMiddleware(), PostCommentValidations.deleteOwnCommentsInAnyPostValidation, PostCommentController.deleteOwnCommentsInAnyPost)

router.put('/edit_own_comment/:userDetailsId/:postId/:commentsId', authMiddleware(), PostCommentValidations.editOwnCommentValidation, PostCommentController.editOwnComments)

module.exports = router
