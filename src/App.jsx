import { useState } from 'react'
import SignInSide from './components/SignInSide'
import Dashboard from './components/Dashboard'
import { AuthContextProvider } from './contexts/AuthContext'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Events from './pages/Events'
import Leaderboard  from './pages/Leaderboard'
import Prizes from './pages/Prizes'
import UserCreator from './pages/UserCreator'
import EventCreator from './pages/EventCreator'
import PrizeCreator from './pages/PrizeCreator'
import EventValidator from './pages/EventValidator'


function App() {
  

  return (
      <AuthContextProvider>
      <div>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Dashboard>
              <Home/>
            </Dashboard>
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Dashboard>
              <Leaderboard/>
            </Dashboard>
          </ProtectedRoute>
        } />  
        <Route path="/events" element={
          <ProtectedRoute>
            <Dashboard>
              <Events/>
            </Dashboard>
          </ProtectedRoute>
        } />  
        <Route path="/prizes" element={
          <ProtectedRoute>
            <Dashboard>
              <Prizes/>
            </Dashboard>
          </ProtectedRoute>
        } />  
        <Route path="/usercreator" element={
          <ProtectedRoute>
            <Dashboard>
              <UserCreator/>
            </Dashboard>
          </ProtectedRoute>
        } /> 
        <Route path="/eventcreator" element={
          <ProtectedRoute>
            <Dashboard>
              <EventCreator/>
            </Dashboard>
          </ProtectedRoute>
        } /> 
        <Route path="/prizecreator" element={
          <ProtectedRoute>
            <Dashboard>
              <PrizeCreator/>
            </Dashboard>
          </ProtectedRoute>
        } /> 
        <Route path="/eventvalidator" element={
          <ProtectedRoute>
            <Dashboard>
              <EventValidator/>
            </Dashboard>
          </ProtectedRoute>
        } /> 
      </Routes>
      
      </div>
      </AuthContextProvider>
  )
}

export default App
