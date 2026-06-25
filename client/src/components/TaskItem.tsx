import type { Task } from '../types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  console.log('module style:', Object.keys(styles));
  return (
    <div className="task-item">
      <h1 className={styles.test}>
        {task.title}
      </h1>
    </div>
  );
}
