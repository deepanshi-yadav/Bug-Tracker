
import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Projects from '../pages/Projects.jsx'
import Tickets from '../pages/Tickets.jsx'
import Board from '../pages/Board.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/projects', element: <Projects /> },
  { path: '/tickets', element: <Tickets /> },
  { path: '/board', element: <Board /> },
])

