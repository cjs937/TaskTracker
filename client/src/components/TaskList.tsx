import type { TaskList as TaskListType } from '../types';
import { TaskItem } from './TaskItem';
import styles from './modules/TaskList.module.css';
import { useState } from 'react';

interface TaskListProps {
  taskList: TaskListType;
}

export function TaskList({ taskList }: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="task-list">
        <h2 className="pill" onClick={() => setIsExpanded(!isExpanded)}>
          {taskList.name}
        </h2>
        { isExpanded && (
          <div className={styles.taskListGrid}>{
            taskList.tasks.map(currTask => (
              <TaskItem key={currTask.id} task={currTask} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
