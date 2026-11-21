const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    priority: {
      type: String,
      default: 'Medium',
    },

    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Ticket', ticketSchema)