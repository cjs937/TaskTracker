import type {User} from '../types'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    user: User;
    onLogout: (token: null, user: null) => void;
}

export function Header({user, onLogout}: HeaderProps){
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        onLogout(null, null);
        navigate('/login');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return(
        <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">TaskTracker</h3>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-700">{user.name}</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>  
                    </button>
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <button
                                onClick={handleDashboard}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}