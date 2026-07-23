import type { User as UserType } from "../types";
import { Project } from "./Project";
import { useNavigate } from 'react-router-dom'

interface DashboardProps {
    userToken: string;
    user: UserType;
}

export function Dashboard({user}:DashboardProps) {
    const navigate = useNavigate();

    const onProjClicked = (projectID: number) => {
        navigate(`/projects/${projectID}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Dashboard</h2>
                <div className="flex flex-wrap gap-3">
                    {user.projects.map(currProject => (
                        <div 
                            key={currProject.id} 
                            onClick={() => onProjClicked(currProject.id)}
                            className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            {currProject.name}
                        </div>
                    ))}
                    <div className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                        +
                    </div>
                </div>
            </div>
        </div>
    );
}