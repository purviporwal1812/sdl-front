import 'animate.css';
import './App.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
// ← switch this import:
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import MarkAttendance from './components/MarkAttendance';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';

// use createHashRouter instead of createBrowserRouter
const router = createHashRouter([
  { path: '/',            element: <App /> },
  { path: '/users/login', element: <Login /> },
  { path: '/mark-attendance', element: <MarkAttendance /> },
  { path: '/admin/dashboard', element: <Dashboard /> },
  { path: '/users/register', element: <Register /> },
  { path: '/admin/login',  element: <AdminLogin /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
