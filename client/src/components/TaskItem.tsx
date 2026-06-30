import type { Task } from '../types';
import {TaskModal} from './TaskModal'
import styles from './TaskItem.module.css';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [ismodalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="task-item">
        <button onClick={() => setModalOpen(true)}><h1>{task.title}</h1></button>
      </div>
      
      <TaskModal 
        taskItem={task} 
        show={ismodalOpen}
        onHide={() => { 
          console.log("Closing Modal");
          setModalOpen(false)}
        }
      />
    </>
  );
}
