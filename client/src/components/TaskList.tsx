import type { TaskList as TaskListType } from '../types';
import { TaskItem } from './TaskItem';
import styles from './modules/TaskList.module.css';
import { useState, useEffect } from 'react';
import { GetLocalToken } from '../utils/tokenUtils';
import type {Task} from "../types"

interface TaskListProps {
  taskList: TaskListType;
}

export function TaskList({ taskList }: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  console.log("Loading task list: ", taskList);

  useEffect( () => {
    const getTasks = async () => {
      console.log("Getting tasks...");
      const response = await fetch(`http://localhost:3001/api/tasks/?taskListID=${taskList.id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${GetLocalToken()}`}
      });

      console.log("Server response:", response);
      
      if(response.ok) {
        const data = await response.json();
        setTasks(data);
        console.log("Final tasks:", data);
      }
    }

    getTasks();
  },[taskList.id]);
  
  return ( 
    <>
      <div className="task-list">
        <h2 className="pill" onClick={() => setIsExpanded(!isExpanded)}>
          {taskList.name}
        </h2>
        { isExpanded && (
          tasks && tasks.length > 0 ? 
            <div className={styles.taskListGrid}>{
              tasks.map(currTask => (
              <TaskItem key={currTask.id} task={currTask} />))
            }
            </div> : 
            <div>NO TASKS</div>
          )
        }
      </div>
    </>
  );
}
