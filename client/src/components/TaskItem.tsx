import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="task-item">
      <h1>{task.title}</h1>
    </div>
  );
}
