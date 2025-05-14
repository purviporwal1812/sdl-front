import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import 'animate.css';
import './App.css';

import App             from './App.jsx';
import Login           from './components/Login';
import Register        from './components/Register';
import VerifyCode   from './components/VerifyCode';
import MarkAttendance  from './components/MarkAttendance';
import Dashboard       from './components/Dashboard';
import AdminLogin      from './components/AdminLogin';
import Profile         from './components/Profile';       
import axios from 'axios';

axios.defaults.withCredentials = true;

const router = createHashRouter([
  { path: '/',                element: <App /> },
  { path: '/users/login',     element: <Login /> },
  { path: '/users/register',  element: <Register /> },
  { path: '/users/verify',    element: <VerifyCode /> },
,
  { path: '/mark-attendance', element: <MarkAttendance /> },
  { path: '/profile',         element: <Profile /> },   
  { path: '/admin/login',     element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <Dashboard /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
