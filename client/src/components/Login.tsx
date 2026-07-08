import type {User} from '../types'
import { mockUsers } from '../data/mockUsers';
import { useState } from 'react'
import styles from './modules/Login.module.css'
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    onLogin: (user: User | null) => void;
}

export function Login({onLogin}: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const onFormSubmit = (event: React.SubmitEvent) => {
        event.preventDefault();

        const userCheck = mockUsers.find(
            (user) => user.name === username && user.password === password
        );

        if(userCheck){
            onLogin(userCheck);
            navigate("/dashboard");
        }
        else
            alert('Invalid credentials');
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
    )
}