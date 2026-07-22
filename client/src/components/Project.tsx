import type { Project as ProjectType} from '../types';
import { TaskList } from './TaskList';
import styles from './modules/Project.module.css'
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetLocalToken } from '../utils/tokenUtils';
// interface ProjectProps {
//     project: ProjectType;
// }

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
                    
                    console.log("Fetched project data:", projectData);
                    
                    console.log("Getting task lists...");
                    const taskListResponse = await fetch(`http://localhost:3001/api/taskLists/?projectID=${projectID}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${GetLocalToken()}`}
                    });

                    console.log("Server response:", taskListResponse);
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
        return (<div>Loading...</div>);
    
    return (
        <>
        <div>
            <h2 className="pill">{project.name}</h2>
             
            <div className={styles.taskListRow}>{ (project.taskLists && project.taskLists.length > 0) ?
                project.taskLists.map(currList => (
                <TaskList key={currList.id} taskList={currList} />
                )) : <></> }

                <div className="pill">+</div>
            </div>
            
        </div>

        <footer className={styles.projectFooter}>

            <div className="pill">Edit Tags</div>
            <div className="pill">Search</div>

        </footer>
        </>
    );
}