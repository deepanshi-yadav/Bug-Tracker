
const Ticket = require('../models/Ticket')
const Project = require('../models/Project')
const User = require('../models/User')

// Check Project Membership
const checkProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId)

  if (!project) return { error: 'Project not found', status: 404 }

  const isMember = project.teamMembers.some(
    member => member.toString() === userId
  )

  if (!isMember) {
    return {
      error: 'You are not a member of this project',
      status: 403,
    }
  }

  return { project }
}

// Create Ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, priority, projectId } = req.body

    if (!title || !projectId) {
      return res.status(400).json({
        message: 'Title and project ID are required',
      })
    }

    const result = await checkProjectMember(projectId, req.user.id)

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      projectId,
    })

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Tickets with Filters and Search
const getTickets = async (req, res) => {
  try {
    const { projectId } = req.params
    const { status, priority, assignee, search } = req.query

    const result = await checkProjectMember(projectId, req.user.id)

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    const filter = { projectId }

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignee) filter.assignee = assignee

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const tickets = await Ticket.find(filter)

    res.status(200).json({
      message: 'Tickets fetched successfully',
      count: tickets.length,
      tickets,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update Ticket
const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    const result = await checkProjectMember(ticket.projectId, req.user.id)

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    const { title, description, priority, status } = req.body

    if (title !== undefined) ticket.title = title
    if (description !== undefined) ticket.description = description
    if (priority !== undefined) ticket.priority = priority
    if (status !== undefined) ticket.status = status

    await ticket.save()

    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete Ticket
const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    const result = await checkProjectMember(ticket.projectId, req.user.id)

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    await Ticket.findByIdAndDelete(ticketId)

    res.status(200).json({
      message: 'Ticket deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Assign Ticket
const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params
    const { assigneeId } = req.body

    if (!assigneeId) {
      return res.status(400).json({
        message: 'Assignee ID is required',
      })
    }

    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found',
      })
    }

    const result = await checkProjectMember(ticket.projectId, req.user.id)

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    const assignee = await User.findById(assigneeId)

    if (!assignee) {
      return res.status(404).json({
        message: 'Assignee not found',
      })
    }

    const isAssigneeMember = result.project.teamMembers.some(
      member => member.toString() === assigneeId
    )

    if (!isAssigneeMember) {
      return res.status(400).json({
        message: 'Assignee must be a member of this project',
      })
    }

    ticket.assignee = assigneeId

    await ticket.save()

    res.status(200).json({
      message: 'Ticket assigned successfully',
      ticket,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  assignTicket,
}
