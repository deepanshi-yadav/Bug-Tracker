
const Comment = require('../models/Comment')
const Ticket = require('../models/Ticket')
const Project = require('../models/Project')

// Add Comment
const addComment = async (req, res) => {
  try {
    const { ticketId } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: 'Comment text is required',
      })
    }

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found',
      })
    }

    const project = await Project.findById(ticket.projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    const isMember = project.teamMembers.some(
      member => member.toString() === req.user.id
    )

    if (!isMember) {
      return res.status(403).json({
        message: 'You are not a member of this project',
      })
    }

    const comment = await Comment.create({
      ticketId,
      userId: req.user.id,
      text: text.trim(),
    })

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// Get Comments
const getComments = async (req, res) => {
  try {
    const { ticketId } = req.params

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found',
      })
    }

    const project = await Project.findById(ticket.projectId)

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    const isMember = project.teamMembers.some(
      member => member.toString() === req.user.id
    )

    if (!isMember) {
      return res.status(403).json({
        message: 'You are not a member of this project',
      })
    }

    const comments = await Comment.find({ ticketId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 })

    res.status(200).json({
      message: 'Comments fetched successfully',
      count: comments.length,
      comments,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  addComment,
  getComments,
}
