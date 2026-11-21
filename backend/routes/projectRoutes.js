
const express = require('express')
const router = express.Router()

const protect = require('../middleware/authMiddleware')

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/projectController')

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'PROJECT ROUTES WORKING' })
})

// Project CRUD
router.post('/', protect, createProject)
router.get('/', protect, getProjects)
router.put('/:projectId', protect, updateProject)
router.delete('/:projectId', protect, deleteProject)

// Team Member APIs
router.post('/:projectId/members', protect, addTeamMember)
router.delete('/:projectId/members', protect, removeTeamMember)

module.exports = router
