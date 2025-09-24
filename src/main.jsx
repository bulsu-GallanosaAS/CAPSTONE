import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Feedback from './pages/Feedback.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import SuccessNewPassword from './pages/SuccessNewPassword.jsx'
import FeedbackForm from './pages/FeedbackForm.jsx'
import FeedbackSubmitted from './pages/FeedbackSubmitted.jsx'
import Refilling from './pages/Refilling.jsx'
import RefillRequest from './pages/RefillRequest.jsx'
import RefillRequestSubmitted from './pages/RefillRequestSubmitted.jsx'
import Promos from './pages/Promos.jsx'
import SideDishes from './pages/SideDishes.jsx'
import UnlimitedMenu from './pages/UnlimitedMenu.jsx'
import AlaCarteMenu from './pages/AlaCarteMenu.jsx'
import FeaturedMenu from './pages/FeaturedMenu.jsx'
import Confirmation from './pages/Confirmation.jsx'
import TimesUp from './pages/TimesUp.jsx'
import Reservation from './pages/Reservation.jsx'
import Signup from './pages/Signup.jsx'
import LoginReservation from './pages/LoginReservation.jsx'
import ForgotPasswordReservation from './pages/ForgotPasswordReservation.jsx'
import ConfirmationReservation from './pages/ConfirmationReservation.jsx'
import ResetPasswordReservation from './pages/ResetPasswordReservation.jsx'
import ReservationDate from './pages/ReservationDate.jsx'
import ReservationForm from './pages/ReservationForm.jsx'
import ReservationUpload from './pages/ReservationUpload.jsx'
import ReservationConfirmed from './pages/ReservationConfirmed.jsx'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/feedback', element: <Feedback /> },
  { path: '/login', element: <Login /> },
  { path: '/forgot', element: <ForgotPassword /> },
  { path: '/reset', element: <ResetPassword /> },
  { path: '/reset-success', element: <SuccessNewPassword /> },
  { path: '/feedback-form', element: <FeedbackForm /> },
  { path: '/feedback-submitted', element: <FeedbackSubmitted /> },
  { path: '/refilling', element: <Refilling /> },
  { path: '/refill-request', element: <RefillRequest /> },
  { path: '/refill-request-submitted', element: <RefillRequestSubmitted /> },
  { path: '/register', element: <Register /> },
  { path: '/promos', element: <Promos /> },
  { path: '/sidedish', element: <SideDishes /> },
  { path: '/unlimited', element: <UnlimitedMenu /> },
  { path: '/alacarte', element: <AlaCarteMenu /> },
  { path: '/featuremenu', element: <FeaturedMenu /> },
  { path: '/confirm', element: <Confirmation /> },
  { path: '/timesup', element: <TimesUp /> },
  { path: '/reservation', element: <Reservation /> },
  { path: '/signup', element: <Signup /> },
  { path: '/login-reservation', element: <LoginReservation /> },
  { path: '/loginReservation', element: <LoginReservation /> },
  { path: '/forgot-reservation', element: <ForgotPasswordReservation /> },
  { path: '/forgotReservation', element: <ForgotPasswordReservation /> },
  { path: '/ForgotPasswordReservation', element: <ForgotPasswordReservation /> },
  { path: '/confirmation-reservation', element: <ConfirmationReservation /> },
  { path: '/confirmationReservation', element: <ConfirmationReservation /> },
  { path: '/reset-reservation', element: <ResetPasswordReservation /> },
  { path: '/resetReservation', element: <ResetPasswordReservation /> },
  { path: '/reservation-date', element: <ReservationDate /> },
  { path: '/reservationDate', element: <ReservationDate /> },
  { path: '/reservation-form', element: <ReservationForm /> },
  { path: '/reservationForm', element: <ReservationForm /> },
  { path: '/reservation-upload', element: <ReservationUpload /> },
  { path: '/reservationUpload', element: <ReservationUpload /> },
  { path: '/reservation-confirmed', element: <ReservationConfirmed /> },
  { path: '/reservationConfirmed', element: <ReservationConfirmed /> },
])

const root = createRoot(document.getElementById('root'))
root.render(<RouterProvider router={router} />)


