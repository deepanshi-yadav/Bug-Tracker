
const Project = require('../models/Project')
const User = require('../models/User')

// Create Project
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body

    const project = await Project.create({
      title,
      description,
      teamMembers: [req.user.id],
    })

    res.status(201).json({
      message: 'Project created successfully',
      project,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get All Projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      teamMembers: req.user.id,
    })

    res.status(200).json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update Project
const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body

    const project = await Project.findOne({
      _id: req.params.projectId,
      teamMembers: req.user.id,
    })

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied',
      })
    }

    if (title !== undefined) project.title = title
    if (description !== undefined) project.description = description

    await project.save()

    res.status(200).json({
      message: 'Project updated successfully',
      project,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.projectId,
      teamMembers: req.user.id,
    })

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied',
      })
    }

    res.status(200).json({
      message: 'Project deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add Team Member
const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body

    const project = await Project.findOne({
      _id: req.params.projectId,
      teamMembers: req.user.id,
    })

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied',
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    if (project.teamMembers.some(id => id.toString() === userId)) {
      return res.status(400).json({
        message: 'User is already a team member',
      })
    }

    project.teamMembers.push(user._id)
    await project.save()

    res.status(200).json({
      message: 'Team member added successfully',
      project,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Remove Team Member
const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.body

    const project = await Project.findOne({
      _id: req.params.projectId,
      teamMembers: req.user.id,
    })

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied',
      })
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        message: 'You cannot remove yourself from the project',
      })
    }

    const isMember = project.teamMembers.some(
      id => id.toString() === userId
    )

    if (!isMember) {
      return res.status(404).json({
        message: 'User is not a team member',
      })
    }

    project.teamMembers = project.teamMembers.filter(
      id => id.toString() !== userId
    )

    await project.save()

    res.status(200).json({
      message: 'Team member removed successfully',
      project,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
}
