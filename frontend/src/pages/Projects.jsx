
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function Projects() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [userIds, setUserIds] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load projects')
      }

      setProjects(Array.isArray(data) ? data : [])
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Load Projects
  useEffect(() => {
    let ignore = false

    const loadProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load projects')
        }

        if (!ignore) {
          setProjects(Array.isArray(data) ? data : [])
          setMessage('')
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error.message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      ignore = true
    }
  }, [token])

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Project creation failed')
      }

      setTitle('')
      setDescription('')
      setMessage('Project created successfully!')

      await fetchProjects()
    } catch (error) {
      setMessage(error.message)
    }
  }

  // Add Team Member
  const handleAddMember = async (projectId) => {
    const userId = userIds[projectId]?.trim()

    if (!userId) {
      setMessage('Please enter User ID')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${projectId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add member')
      }

      setMessage(data.message)
      setUserIds((prev) => ({
        ...prev,
        [projectId]: '',
      }))

      await fetchProjects()
    } catch (error) {
      setMessage(error.message)
    }
  }

  // Remove Team Member
  const handleRemoveMember = async (projectId, userId) => {
    if (!window.confirm('Remove this team member?')) return

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${projectId}/members`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to remove member')
      }

      setMessage(data.message)
      await fetchProjects()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navigation Bar */}
      <nav className="bg-white shadow px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-blue-600">
          Bug Tracker
        </h1>

        <div className="flex flex-wrap items-center gap-5">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>

          <Link to="/projects" className="text-blue-600 font-semibold">
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
          Projects
        </h1>

        <p className="mt-2 text-gray-600">
          Create and manage your projects here.
        </p>

        {/* Create Project */}
        <div className="bg-white p-6 rounded-xl shadow mt-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-5">
            Create New Project
          </h2>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border p-3 rounded-lg"
            />

            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-3 rounded-lg"
              rows="4"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Project
            </button>
          </form>
        </div>

        {message && (
          <p className="mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}

        {/* All Projects */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            All Projects ({projects.length})
          </h2>

          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white p-6 rounded-xl shadow"
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {project.title}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Team Members */}
                  <div className="mt-5">
                    <h4 className="font-semibold text-gray-800">
                      Team Members ({project.teamMembers.length})
                    </h4>

                    <div className="mt-3 space-y-3">
                      {project.teamMembers.map((memberId) => (
                        <div
                          key={memberId}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <span className="text-sm text-gray-600 break-all">
                            {memberId}
                          </span>

                          <button
                            onClick={() =>
                              handleRemoveMember(project._id, memberId)
                            }
                            className="text-red-600 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Team Member */}
                  <div className="mt-5 border-t pt-4">
                    <h4 className="font-semibold mb-2">
                      Add Team Member
                    </h4>

                    <input
                      type="text"
                      placeholder="Enter User MongoDB ID"
                      value={userIds[project._id] || ''}
                      onChange={(e) =>
                        setUserIds({
                          ...userIds,
                          [project._id]: e.target.value,
                        })
                      }
                      className="w-full border p-3 rounded-lg"
                    />

                    <button
                      onClick={() => handleAddMember(project._id)}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Team Member
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-400 break-all">
                    Project ID: {project._id}
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

export default Projects
