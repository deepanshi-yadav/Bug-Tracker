
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Board() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [tickets, setTickets] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [draggedTicket, setDraggedTicket] = useState(null)

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load projects')
        }

        const projectList = Array.isArray(data)
          ? data
          : data.projects || []

        setProjects(projectList)

        if (projectList.length > 0) {
          setProjectId(projectList[0]._id)
        }
      } catch (error) {
        setMessage(error.message)
      }
    }

    loadProjects()
  }, [token])

  useEffect(() => {
    if (!projectId) return

    const loadTickets = async () => {
      setLoading(true)

      try {
        const response = await fetch(
          `http://localhost:5000/api/tickets/project/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load tickets')
        }

        setTickets(data.tickets || [])
        setMessage('')
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [projectId, token])

  const updateStatus = async (ticketId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update status')
      }

      setTickets(previous =>
        previous.map(ticket =>
          ticket._id === ticketId ? { ...ticket, status } : ticket
        )
      )

      setMessage('Ticket status updated successfully!')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleDrop = (event, status) => {
    event.preventDefault()

    if (!draggedTicket) return

    const ticket = tickets.find(
      item => item._id === draggedTicket
    )

    if (ticket && ticket.status !== status) {
      updateStatus(draggedTicket, status)
    }

    setDraggedTicket(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const statuses = ['To Do', 'In Progress', 'Done']

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold text-blue-600">Bug Tracker</h1>

        <div className="flex flex-wrap items-center gap-5">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tickets">Tickets</Link>
          <Link to="/board" className="font-semibold text-blue-600">
            Board
          </Link>
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6">
        <h1 className="mb-2 text-3xl font-bold">Kanban Board</h1>
        <p className="mb-6 text-gray-600">
          Track your project tickets by status.
        </p>

        <div className="mb-6 max-w-sm">
          <label className="mb-2 block font-medium">Select Project</label>
          <select
            className="w-full rounded border bg-white p-2"
            value={projectId}
            onChange={event => setProjectId(event.target.value)}
          >
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        {message && <p className="mb-4 text-blue-600">{message}</p>}

        {loading && <p>Loading tickets...</p>}

        {!loading && !projectId && (
          <p>No projects found. Create a project first.</p>
        )}

        {!loading && projectId && (
          <div className="grid gap-5 md:grid-cols-3">
            {statuses.map(status => {
              const statusTickets = tickets.filter(
                ticket => ticket.status === status
              )

              return (
                <section
                  key={status}
                  onDragOver={event => event.preventDefault()}
                  onDrop={event => handleDrop(event, status)}
                  className="min-h-64 rounded-lg bg-white p-4 shadow"
                >
                  <h2 className="mb-4 text-lg font-bold">{status}</h2>

                  {statusTickets.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No tickets here.
                    </p>
                  )}

                  <div className="space-y-3">
                    {statusTickets.map(ticket => (
                      <div
                        key={ticket._id}
                        draggable
                        onDragStart={() => setDraggedTicket(ticket._id)}
                        onDragEnd={() => setDraggedTicket(null)}
                        className="cursor-grab rounded-lg border bg-white p-3 active:cursor-grabbing"
                      >
                        <h3 className="font-semibold">{ticket.title}</h3>

                        <p className="my-2 text-sm text-gray-600">
                          {ticket.description}
                        </p>

                        <p className="mb-3 text-sm">
                          Priority: {ticket.priority}
                        </p>

                        <label className="mb-1 block text-sm font-medium">
                          Change Status
                        </label>

                        <select
                          className="w-full rounded border p-2"
                          value={ticket.status}
                          onChange={event =>
                            updateStatus(ticket._id, event.target.value)
                          }
                        >
                          {statuses.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Board
