import type {User} from '../types'
import { mockUsers } from '../data/mockUsers';
import { useState } from 'react'
import styles from './modules/Login.module.css'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from 'jwt-decode';
import { ConstructUserFromToken } from "../utils/tokenUtils"

interface LoginProps {
    onLogin: (token: string | null, user: User | null) => void;
}

interface JwtUserPayload extends JwtPayload {
    id: string;
    name: string;
    authority: "admin" | "user" | "viewer";
}

export function Login({onLogin}: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const onFormSubmit = async (event: React.SubmitEvent) => {
        event.preventDefault();
    try{
        const response = await fetch("http://localhost:3001/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: username, password: password})
        });

        const data = await response.json();

        if(response.ok) {
            const outUser = await ConstructUserFromToken(data.authToken);

            onLogin(data.authToken, outUser);
            navigate("/dashboard");
        }
        else
            alert(data.error || 'Invalid credentials');
    }
    catch (error) {
        console.error("Login error:", error);
        alert("Failed to connect to server");
    }
    };

    return (
        <>
            <h1>Login Pls!</h1>
            <form id="LoginForm" className="container" onSubmit={onFormSubmit}>
                <div className={styles.loginColumn}>
                    <input type="text" placeholder='Enter Username' required 
                        onChange={(input) => setUsername(input.target.value)}/>
                    <input type="password" placeholder='Enter Password' required 
                        onChange={(input) => setPassword(input.target.value)}/>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </>
    );
}