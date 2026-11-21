
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const ticketRoutes = require('./routes/ticketRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Main server test
app.get('/', (req, res) => {
  res.send('Bug Tracker Backend is running!')
})

// Project route test
app.get('/test-server', (req, res) => {
  res.send('MAIN SERVER IS WORKING')
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/comments', commentRoutes)

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
  }
}

startServer()
