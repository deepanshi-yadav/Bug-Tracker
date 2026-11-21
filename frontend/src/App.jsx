
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold text-blue-600">
          Bug Tracker
        </h1>

        <div className="flex flex-wrap gap-5">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tickets">Tickets</Link>
          <Link to="/board">Board</Link>
        </div>
      </nav>

      <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-blue-600">
          Bug Tracker Application
        </h1>

        <p className="mb-6 text-gray-600">
          Manage your projects and track bugs easily.
        </p>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="rounded bg-blue-600 px-6 py-3 text-white"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded border border-blue-600 px-6 py-3 text-blue-600"
          >
            Register
          </Link>
        </div>
      </main>
    </div>
  )
}

export default App
