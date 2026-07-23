import type { Project as ProjectType} from '../types';
import { TaskList } from './TaskList';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetLocalToken } from '../utils/tokenUtils';

export function Project()
{
    const { projectID } = useParams<{ projectID: string }>();
    const [project, setProject] = useState(null);

    console.log("Loading project: ", projectID);

    useEffect(() => {
        if(!projectID) return;
        const loadProjectData = async () => {
            try {
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

                    const taskListData = await taskListResponse.json();

                    const proj = {...projectData, taskLists: taskListData || []};
                    setProject(proj);
                    console.log("Final project:", proj);
            }
            catch (error) {
                console.error("Error loading project data:", error);
            }
        }

        loadProjectData();
    }, [projectID]);

    if(!project || !project.taskLists)
        return (<div className="flex justify-center items-center min-h-screen">Loading...</div>);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">{project.name}</h2>

                <div className="flex flex-wrap gap-4 mb-8">
                    { (project.taskLists && project.taskLists.length > 0) ?
                        project.taskLists.map(currList => (
                        <TaskList key={currList.id} taskList={currList} />
                        )) : <></> }

                    <div className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                        +
                    </div>
                </div>

                <footer className="flex gap-3">
                    <div className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                        Edit Tags
                    </div>
                    <div className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                        Search
                    </div>
                </footer>
            </div>
        </div>
    );
}