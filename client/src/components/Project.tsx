import type { Project as ProjectType} from '../types';
import { TaskList } from './TaskList';
import { EditableText } from './EditableText';
import { Search } from './Search';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetLocalToken } from '../utils/tokenUtils';
import { useNavigate } from 'react-router-dom';

export function Project()
{
    const { projectID } = useParams<{ projectID: string }>();
    const [project, setProject] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    console.log("Loading project: ", projectID);

    const deleteProject = async () => {
        try {
            const deleteResult = await fetch(`http://localhost:3001/api/projects/${projectID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${GetLocalToken()}`
                }
            });

            if(deleteResult.ok)
            {
                navigate("/dashboard");
            }
        }
        catch(error) {
            console.error("Error deleting project:", error);
            alert("Server error");
        }
    }

    const addNewTaskList = async () => {
        try {
            const postResult = await fetch("http://localhost:3001/api/taskLists/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetLocalToken()}`
                },
                body: JSON.stringify({ taskList: { name: "New Task List" }, projectID: projectID })
            });

            if(postResult.ok) {
                //const newTaskList = await postResult.json();
                //setProject({...project, taskLists: [...(project.taskLists || []), newTaskList]});
                loadProjectData();
            }
        }
        catch(error) {
            console.error("Error creating task list:", error);
            alert("Server error");
        }
    }

    const updateProjectName = async (newName: string) => {
        try {
            const patchResult = await fetch(`http://localhost:3001/api/projects/${projectID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetLocalToken()}`
                },
                body: JSON.stringify({ name: newName })
            });

            if(patchResult.ok) {
                loadProjectData();
            }
        }
        catch(error) {
            console.error("Error updating project name:", error);
            alert("Server error");
        }
    }

    const deleteTaskList = async (taskListID: number) => {
        try {
            const deleteResult = await fetch(`http://localhost:3001/api/taskLists/${taskListID}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${GetLocalToken()}`
                }
            });

            if(deleteResult.ok) {
                setProject({...project, taskLists: (project.taskLists || []).filter(list => list.id !== taskListID)});
                loadProjectData();
            }
        }
        catch(error) {
            console.error("Error deleting task list:", error);
            alert("Server error");
        }
    }

    const loadProjectData = async () => {
        console.log("Refreshing project data. ProjID:", projectID);
        try {
                if(!projectID) throw new Error("Invalid projectID");
                const projectResult = await fetch(`http://localhost:3001/api/projects/${projectID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${GetLocalToken()}`}
                });

                const projectData = await projectResult.json();

                if(!projectResult.ok) {
                    alert(projectData.error || "Invalid request for project data");
                    return;
                }

                const taskListResponse = await fetch(`http://localhost:3001/api/taskLists/?projectID=${projectID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${GetLocalToken()}`}
                });

                const taskListData = taskListResponse.ok ? (await taskListResponse.json()) : [];

                const proj = {...projectData, taskLists: taskListData};//taskListData || []};
                setProject(proj);
                console.log("Final project:", proj);
        }
        catch (error) {
                console.error("Error loading project data:", error);
        }
    }

    useEffect(() => {
        loadProjectData();
    }, [projectID]);

    if(!project || !project.taskLists)
        return (<div className="flex justify-center items-center min-h-screen">Loading...</div>);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={project.name}
                    onSave={updateProjectName}
                    className="text-3xl font-semibold text-gray-800 mb-6 block"
                />

                <div className="flex flex-wrap gap-4 mb-8 items-start"> { 
                    (project.taskLists && project.taskLists.length > 0) ?
                        project.taskLists.map(currList => (
                        <TaskList key={currList.id} taskList={currList} onDataChanged={loadProjectData} 
                        onDeleteTaskList={deleteTaskList} />)) 
                        : <></> 
                    }

                    <div className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                         onClick={addNewTaskList}>
                        + Add List
                    </div>
                </div>

                <footer className="flex gap-3">
                    <div
                        className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        Search
                    </div>
                    <div className="bg-red border-2 border-red-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors" onClick={deleteProject}>
                        Delete Project
                    </div>
                </footer>
                <Search
                    show={isSearchOpen}
                    onHide={() => setIsSearchOpen(false)}
                    taskLists={project.taskLists}
                />
            </div>
        </div>
    );
}