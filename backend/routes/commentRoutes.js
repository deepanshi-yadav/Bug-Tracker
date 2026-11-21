
const express = require('express')
const router = express.Router()

const protect = require('../middleware/authMiddleware')

const {
  addComment,
  getComments,
} = require('../controllers/commentController')

// Protected Comment Routes
router.post('/:ticketId', protect, addComment)

router.get('/:ticketId', protect, getComments)

module.exports = router
