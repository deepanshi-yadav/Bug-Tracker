
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function Tickets() {
  const [tickets, setTickets] = useState([])
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')

  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [search, setSearch] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [comments, setComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [openComments, setOpenComments] = useState({})

  const [editingTicket, setEditingTicket] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
  })

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  useEffect(() => {
    let ignore = false

    async function loadProjects() {
      try {
        const response = await fetch(
          `${API_URL}/api/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load projects')
        }

        const projectList = Array.isArray(data)
          ? data
          : data.projects || []

        if (!ignore) {
          setProjects(projectList)
          setProjectId(current =>
            current || projectList[0]?._id || ''
          )
        }
      } catch (error) {
        if (!ignore) setMessage(error.message)
      }
    }

    loadProjects()

    return () => {
      ignore = true
    }
  }, [token])

  useEffect(() => {
    if (!projectId) return

    let ignore = false

    async function loadTickets() {
      setLoading(true)

      try {
        const params = new URLSearchParams()

        if (statusFilter) params.append('status', statusFilter)
        if (priorityFilter) params.append('priority', priorityFilter)
        if (assigneeFilter) params.append('assignee', assigneeFilter)
        if (search.trim()) params.append('search', search.trim())

        const response = await fetch(
          `${API_URL}/api/tickets/project/${projectId}?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load tickets')
        }

        if (!ignore) {
          setTickets(data.tickets || [])
          setMessage('')
        }
      } catch (error) {
        if (!ignore) setMessage(error.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadTickets()

    return () => {
      ignore = true
    }
  }, [
    projectId,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    search,
    token,
  ])

  const refreshTickets = async () => {
    if (!projectId) return

    try {
      const response = await fetch(
        `${API_URL}/api/tickets/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to refresh tickets')
      }

      setTickets(data.tickets || [])
    } catch (error) {
      setMessage(error.message)
    }
  }

  const createTicket = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            priority,
            projectId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create ticket')
      }

      setTitle('')
      setDescription('')
      setPriority('Medium')
      setMessage('Ticket created successfully!')

      await refreshTickets()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const updateTicket = async (ticketId, updates) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update ticket')
      }

      setMessage('Ticket updated successfully!')
      await refreshTickets()
      return true
    } catch (error) {
      setMessage(error.message)
      return false
    }
  }

  const openEditTicket = (ticket) => {
    setEditingTicket(ticket)

    setEditForm({
      title: ticket.title,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
    })
  }

  const saveEditTicket = async (event) => {
    event.preventDefault()

    const success = await updateTicket(
      editingTicket._id,
      editForm
    )

    if (success) {
      setEditingTicket(null)
    }
  }

  const assignTicket = async (ticketId, memberId) => {
    if (!memberId) return

    try {
      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assigneeId: memberId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to assign ticket')
      }

      setMessage('Ticket assigned successfully!')
      await refreshTickets()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete ticket')
      }

      setMessage('Ticket deleted successfully!')
      await refreshTickets()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const loadComments = async (ticketId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/comments/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load comments')
      }

      setComments(prev => ({
        ...prev,
        [ticketId]: data.comments || [],
      }))
    } catch (error) {
      setMessage(error.message)
    }
  }

  const addComment = async (ticketId) => {
    const text = commentInputs[ticketId] || ''

    if (!text.trim()) {
      setMessage('Please enter a comment')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/comments/${ticketId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add comment')
      }

      setCommentInputs(prev => ({
        ...prev,
        [ticketId]: '',
      }))

      setMessage('Comment added successfully!')
      await loadComments(ticketId)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const toggleComments = async (ticketId) => {
    const isOpen = openComments[ticketId]

    setOpenComments(prev => ({
      ...prev,
      [ticketId]: !isOpen,
    }))

    if (!isOpen && !comments[ticketId]) {
      await loadComments(ticketId)
    }
  }

  const selectedProject = projects.find(
    project => project._id === projectId
  )

  const teamMembers = selectedProject?.teamMembers || []

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-white shadow px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-blue-600">
          Bug Tracker
        </h1>

        <div className="flex flex-wrap items-center gap-5">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>

          <Link to="/projects" className="text-gray-700 hover:text-blue-600">
            Projects
          </Link>

          <Link to="/tickets" className="text-blue-600 font-semibold">
            Tickets
          </Link>

          <Link to="/board" className="text-gray-700 hover:text-blue-600">
            Board
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

        <h1 className="mb-2 text-3xl font-bold">Tickets</h1>

        <p className="mb-6 text-gray-600">
          Create and manage project bugs and issues.
        </p>

        {message && (
          <div className="mb-4 rounded bg-white p-3 text-gray-700 shadow">
            {message}
          </div>
        )}

        <div className="mb-6 rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Create New Ticket
          </h2>

          <form onSubmit={createTicket} className="space-y-3">
            <label className="block font-medium">Ticket Title</label>

            <input
              type="text"
              placeholder="Enter ticket title"
              className="w-full rounded border p-2"
              value={title}
              onChange={event => setTitle(event.target.value)}
              required
            />

            <label className="block font-medium">Description</label>

            <textarea
              placeholder="Describe the issue"
              className="w-full rounded border p-2"
              value={description}
              onChange={event => setDescription(event.target.value)}
            />

            <label className="block font-medium">Select Project</label>

            <select
              className="w-full rounded border p-2"
              value={projectId}
              onChange={event => setProjectId(event.target.value)}
              required
            >
              <option value="">Select Project</option>

              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>

            <label className="block font-medium">Select Priority</label>

            <select
              className="w-full rounded border p-2"
              value={priority}
              onChange={event => setPriority(event.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <button
              type="submit"
              disabled={!projectId}
              className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              Create Ticket
            </button>
          </form>
        </div>

        <div className="mb-6 rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Filter Tickets
          </h2>

          <div className="grid gap-3 md:grid-cols-4">

            <div>
              <label className="mb-1 block font-medium">
                Search Tickets
              </label>

              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded border p-2"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">
                Filter by Status
              </label>

              <select
                className="w-full rounded border p-2"
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">
                Filter by Priority
              </label>

              <select
                className="w-full rounded border p-2"
                value={priorityFilter}
                onChange={event => setPriorityFilter(event.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">
                Filter by Assignee
              </label>

              <select
                className="w-full rounded border p-2"
                value={assigneeFilter}
                onChange={event => setAssigneeFilter(event.target.value)}
              >
                <option value="">All Members</option>

                {teamMembers.map(member => {
                  const memberId =
                    typeof member === 'string' ? member : member._id

                  return (
                    <option key={memberId} value={memberId}>
                      {typeof member === 'string'
                        ? memberId
                        : member.name || member.email || memberId}
                    </option>
                  )
                })}
              </select>
            </div>

          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Ticket List
          </h2>

          {loading && <p>Loading tickets...</p>}

          {!loading && tickets.length === 0 && (
            <p className="text-gray-500">No tickets found.</p>
          )}

          <div className="space-y-4">
            {tickets.map(ticket => (
              <div
                key={ticket._id}
                className="rounded-lg border p-4"
              >
                <h3 className="text-lg font-semibold">
                  {ticket.title}
                </h3>

                <p className="my-2 text-gray-600">
                  {ticket.description}
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block font-medium">
                      Status
                    </label>

                    <select
                      className="w-full rounded border p-2"
                      value={ticket.status}
                      onChange={event =>
                        updateTicket(ticket._id, {
                          status: event.target.value,
                        })
                      }
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium">
                      Priority
                    </label>

                    <select
                      className="w-full rounded border p-2"
                      value={ticket.priority}
                      onChange={event =>
                        updateTicket(ticket._id, {
                          priority: event.target.value,
                        })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium">
                      Assign To
                    </label>

                    <select
                      className="w-full rounded border p-2"
                      value={
                        typeof ticket.assignee === 'object'
                          ? ticket.assignee?._id || ''
                          : ticket.assignee || ''
                      }
                      onChange={event =>
                        assignTicket(ticket._id, event.target.value)
                      }
                    >
                      <option value="">Unassigned</option>

                      {teamMembers.map(member => {
                        const memberId =
                          typeof member === 'string'
                            ? member
                            : member._id

                        return (
                          <option key={memberId} value={memberId}>
                            {typeof member === 'string'
                              ? memberId
                              : member.name || member.email || memberId}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditTicket(ticket)}
                  className="mt-4 mr-2 rounded bg-yellow-500 px-4 py-2 text-white"
                >
                  Edit Ticket
                </button>

                <button
                  type="button"
                  onClick={() => deleteTicket(ticket._id)}
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
                >
                  Delete Ticket
                </button>

                <div className="mt-4 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => toggleComments(ticket._id)}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                  >
                    {openComments[ticket._id]
                      ? 'Hide Comments'
                      : 'View Comments'}
                  </button>

                  {openComments[ticket._id] && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-semibold">
                        Ticket Comments
                      </h4>

                      <textarea
                        placeholder="Write a comment..."
                        className="w-full rounded border p-2"
                        value={commentInputs[ticket._id] || ''}
                        onChange={event =>
                          setCommentInputs(prev => ({
                            ...prev,
                            [ticket._id]: event.target.value,
                          }))
                        }
                      />

                      <button
                        type="button"
                        onClick={() => addComment(ticket._id)}
                        className="rounded bg-green-600 px-4 py-2 text-white"
                      >
                        Add Comment
                      </button>

                      <div className="space-y-2">
                        {(comments[ticket._id] || []).length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No comments yet.
                          </p>
                        ) : (
                          comments[ticket._id].map(comment => (
                            <div
                              key={comment._id}
                              className="rounded border bg-gray-50 p-3"
                            >
                              <p className="font-medium">
                                {comment.userId?.name ||
                                  comment.userId?.email ||
                                  'User'}
                              </p>

                              <p className="mt-1 text-gray-700">
                                {comment.text}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <form
              onSubmit={saveEditTicket}
              className="w-full max-w-lg space-y-3 rounded-lg bg-white p-6"
            >
              <h2 className="text-xl font-bold">Edit Ticket</h2>

              <label className="block font-medium">Ticket Title</label>

              <input
                type="text"
                className="w-full rounded border p-2"
                value={editForm.title}
                onChange={event =>
                  setEditForm({
                    ...editForm,
                    title: event.target.value,
                  })
                }
                required
              />

              <label className="block font-medium">Description</label>

              <textarea
                className="w-full rounded border p-2"
                value={editForm.description}
                onChange={event =>
                  setEditForm({
                    ...editForm,
                    description: event.target.value,
                  })
                }
              />

              <label className="block font-medium">Priority</label>

              <select
                className="w-full rounded border p-2"
                value={editForm.priority}
                onChange={event =>
                  setEditForm({
                    ...editForm,
                    priority: event.target.value,
                  })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <label className="block font-medium">Status</label>

              <select
                className="w-full rounded border p-2"
                value={editForm.status}
                onChange={event =>
                  setEditForm({
                    ...editForm,
                    status: event.target.value,
                  })
                }
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="rounded bg-gray-500 px-4 py-2 text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default Tickets
