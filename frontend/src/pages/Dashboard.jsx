
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [tickets, setTickets] = useState([])
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setMessage('Please log in again.')
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const projectResponse = await fetch(
          `${API_URL}/api/projects`,
          { headers }
        )

        const projectData = await projectResponse.json()

        if (!projectResponse.ok) {
          throw new Error(projectData.message || 'Unable to load projects')
        }

        setProjects(Array.isArray(projectData) ? projectData : [])

        if (projectData.length === 0) {
          setTickets([])
          return
        }

        const projectId = projectData[0]._id

        const ticketResponse = await fetch(
          `${API_URL}/api/tickets/project/${projectId}`,
          { headers }
        )

        const ticketData = await ticketResponse.json()

        if (!ticketResponse.ok) {
          throw new Error(ticketData.message || 'Unable to load tickets')
        }

        setTickets(ticketData.tickets || [])
        setMessage('')
      } catch (error) {
        setMessage(error.message)
      }
    }

    fetchDashboardData()
  }, [])

  const todoCount = tickets.filter(
    ticket => ticket.status === 'To Do'
  ).length

  const progressCount = tickets.filter(
    ticket => ticket.status === 'In Progress'
  ).length

  const doneCount = tickets.filter(
    ticket => ticket.status === 'Done'
  ).length

  const stats = [
    { title: 'Total Projects', count: projects.length },
    { title: 'Total Tickets', count: tickets.length },
    { title: 'To Do', count: todoCount },
    { title: 'In Progress', count: progressCount },
    { title: 'Completed', count: doneCount },
  ]

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navigation Bar */}
      <nav className="bg-white shadow px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-blue-600">
          Bug Tracker
        </h1>

        <div className="flex flex-wrap items-center gap-5">
          <Link to="/dashboard" className="text-blue-600 font-semibold">
            Dashboard
          </Link>

          <Link to="/projects" className="text-gray-700 hover:text-blue-600">
            Projects
          </Link>

          <Link to="/tickets" className="text-gray-700 hover:text-blue-600">
            Tickets
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to your Bug Tracker Dashboard.
        </p>

        {message && (
          <p className="mt-4 text-red-600">{message}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {stats.map(stat => (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h2 className="text-gray-500">{stat.title}</h2>
              <p className="text-3xl font-bold text-blue-600 mt-3">
                {stat.count}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Tickets
          </h2>

          {tickets.length === 0 ? (
            <p className="text-gray-500">No tickets found.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket._id} className="border-b pb-3">
                  <h3 className="font-semibold text-gray-800">
                    {ticket.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Priority: {ticket.priority} | Status: {ticket.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
