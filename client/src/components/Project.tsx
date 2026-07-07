import type { Project as ProjectType} from '../types';
import { TaskList } from './TaskList';
import styles from './modules/Project.module.css'
interface ProjectProps {
    project: ProjectType;
}

export function Project({project}:ProjectProps)
{
    return (
        <>
        <div>
            <h2 className="pill">{project.name}</h2>
            <div className={styles.taskListRow}>
            {
                /* Implement your task list rendering here */
                project.taskLists.map(currList => (
                <TaskList key={currList.id} taskList={currList} />
                ))
            }
            </div>
        </div>
        <footer className={styles.projectFooter}>
            <div className="pill">Edit Tags</div>
            <div className="pill">Search</div>
        </footer>
        </>
    );
}