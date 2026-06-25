import type { TaskList as TaskListType } from '../types';
import { TaskItem } from './TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  taskList: TaskListType;
}

export function TaskList({ taskList }: TaskListProps) {
  return (
    <div className="task-list">
      <h2>{taskList.name}</h2>
      <div className={styles.taskListGrid}>
      {
        /* Implement your task list rendering here */
        taskList.tasks.map(currTask => (
          <TaskItem key={currTask.id} task={currTask} />
        ))
      }
      </div>
    </div>
  );
}
