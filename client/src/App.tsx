import { cache, useState, useEffect } from 'react'
import type { User } from './types'
import { BrowserRouter, Routes, Route, Navigate, data } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { Project } from "./components/Project"
import { ConstructUserFromToken } from "./utils/tokenUtils"
import { Header } from "./components/Header"

function App() {

  function handleSetUser(token: string | null, newUser : User | null) {

    localStorage.setItem("authToken", token);
  
    setUserToken(token);
    setUser(newUser);
  };

  const [userToken, setUserToken] = useState <string | null>(() => {
    const cachedToken = localStorage.getItem('authToken');
    return cachedToken || null;
  });

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const cachedToken = localStorage.getItem('authToken');

      if(cachedToken && cachedToken !== null) {
        
        const tokenValidation = await fetch(`http://localhost:3001/api/auth/${cachedToken}`, {
          method: "GET",
        });

        if(tokenValidation.ok)
          setUser( await ConstructUserFromToken(cachedToken) );
        else {
          localStorage.removeItem("authToken");
          setUser(null);
          setUserToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeUser();
  }, [userToken]);

  return (
    <BrowserRouter>
      {user && <Header user={user} onLogout={handleSetUser}/>}
      <div className={user ? "pt-16" : ""}>
        <Routes>
          <Route path="/projects/:projectID" element={<Project />} />
          <Route path="/login" element={ userToken ? <Navigate to="/dashboard" /> : 
            <Login onLogin={handleSetUser} />} />

          <Route path="/dashboard" element={loading ? <div>Loading...</div> :
           user ? 
            <Dashboard userToken={userToken} user={user}/> : 
            <Navigate to='/login' />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App    