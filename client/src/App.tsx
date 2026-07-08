import { useState } from 'react'
import type { User } from './types'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'


function App() {
const [user, setUser] = useState <User | null>(()=> {
  const cachedUser = localStorage.getItem('currUser');
  return cachedUser ? JSON.parse(cachedUser) : null;
});

function handleSetUser(newUser : User | null) {
  if(newUser)
    localStorage.setItem('currUser', JSON.stringify(newUser));
  else
    localStorage.removeItem('currUser');

  setUser(newUser);
};

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleSetUser} />} />
          <Route path="/dashboard" element={user ? 
            <Dashboard user={user} onLogout={handleSetUser}/> : 
            <Navigate to='/login' />} 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App      