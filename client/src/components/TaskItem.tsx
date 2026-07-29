import type { Task } from '../types';
import {TaskModal} from './TaskModal'
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onDataChanged: () => void;
  onDeleteTask?: (taskID: number) => void;
}

export function TaskItem({ task, onDeleteTask, onDataChanged }: TaskItemProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="task-item flex justify-between items-center">
        <div className="flex-1 cursor-pointer" onClick={() => setModalOpen(true)}>
          {task.name}
        </div>
        {onDeleteTask && (
          <button
            onClick={() => onDeleteTask(task.id)}
            className="text-red-500 hover:text-red-700 transition-colors text-sm ml-2"
          >
            Delete
          </button>
        )}
      </div>

      <TaskModal
        taskItem={task}
        show={isModalOpen}
        onDataChanged={onDataChanged}
        onHide={() => {
          setModalOpen(false)
        }}
        onDeleteTask={onDeleteTask}
      />
    </>
  );
}
