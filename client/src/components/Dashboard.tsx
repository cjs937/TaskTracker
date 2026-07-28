import type { User as UserType } from "../types";
import { Project } from "./Project";
import { useNavigate } from 'react-router-dom';
import { GetLocalToken } from "../utils/tokenUtils";
import { useState, useEffect } from "react";

interface DashboardProps {
    userToken: string;
    user: UserType;
}

export function Dashboard({user}:DashboardProps) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState(user.projects);
    const onProjClicked = (projectID: number) => {
        navigate(`/projects/${projectID}`);
    };

    const addNewProject = async () => {
        try {
            const postResult = await fetch("http://localhost:3001/api/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetLocalToken()}`
                },
                body: JSON.stringify({project: { name: "New Project"} , userID: user.id})
            });

            if(postResult.ok)
            {
                const newProject = await postResult.json();
                setProjects([...projects, newProject]);
            }
        }
        catch(error) {
            console.error("Error creating new project:", error);
            alert("Server error");
        }

    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/projects/?userID=${user.id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${GetLocalToken()}`
                    }
                });
                
                if(response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
                
            } catch(error) {
                console.error("Error fetching projects:", error);
            }
        };
    
        fetchProjects();
    }, [user.id]);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Dashboard</h2>
                <div className="flex flex-wrap gap-3">
                    {projects.map(currProject => (
                        <div 
                            key={currProject.id} 
                            onClick={() => onProjClicked(currProject.id)}
                            className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            {currProject.name}
                        </div>
                    ))}
                    <div className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={addNewProject}>
                        +
                    </div>
                </div>
            </div>
        </div>
    );
}