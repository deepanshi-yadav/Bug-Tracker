
const express = require('express')
const router = express.Router()

const protect = require('../middleware/authMiddleware')

const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  assignTicket,
} = require('../controllers/ticketController')

// Protected Ticket Routes
router.post('/', protect, createTicket)

router.get('/project/:projectId', protect, getTickets)

router.put('/:ticketId', protect, updateTicket)

router.delete('/:ticketId', protect, deleteTicket)

router.put('/:ticketId/assign', protect, assignTicket)

module.exports = router
