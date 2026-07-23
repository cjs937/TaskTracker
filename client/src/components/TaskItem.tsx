import type { Task } from '../types';
import {TaskModal} from './TaskModal'
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="task-item">
        <button
          onClick={() => setModalOpen(true)}
          className="text-left text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded px-2 py-1 w-full"
        >
          {task.name}
        </button>
      </div>

      <TaskModal
        taskItem={task}
        show={isModalOpen}
        onHide={() => {
          setModalOpen(false)}
        }
      />
    </>
  );
}
