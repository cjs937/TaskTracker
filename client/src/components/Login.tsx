import type {User} from '../types'
import { mockUsers } from '../data/mockUsers';
import { useState } from 'react'
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
            console.log("Auth token:", data.authToken);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Login</h1>
                <form onSubmit={onFormSubmit} className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder='Enter Username' 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onChange={(input) => setUsername(input.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder='Enter Password' 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onChange={(input) => setPassword(input.target.value)}
                    />
                    <button 
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}