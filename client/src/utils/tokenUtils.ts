import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';
import type { User } from '../types';
 
interface JwtUserPayload extends JwtPayload {
  id: string;
  name: string;
  authority: "admin" | "user" | "viewer";
}
 
export async function ConstructUserFromToken (token: string): Promise<User | null> {
    
    if (!token) {
        console.log("Could not decode invalid token.");
        return null;
    }
    
    const payload = jwtDecode<JwtUserPayload>(token);
    
    const outUser: User = {
        id: payload.id,
        name: payload.name,
        authority: payload.authority,
        projects: []
    };

    const response = await fetch(`http://localhost:3001/api/projects/?userID=${outUser.id}`, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
        }
    });

    if(response.ok) {
        const data = await response.json();
        outUser.projects = data;
    }

    return outUser;
}

export function GetLocalToken() {
    return localStorage.getItem('authToken');
}

export function getTokenExpirationTime(token: string): number | null {
    if (!token) return null;
    
    try {
        const payload = jwtDecode<JwtUserPayload>(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        const timeUntilExpiry = payload.exp - currentTime;
        
        if (timeUntilExpiry <= 0) {
            return 0; // Already expired
        }
        
        return timeUntilExpiry * 1000; // Return milliseconds
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}