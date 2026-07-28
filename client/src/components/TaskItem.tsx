import type { Task } from '../types';
import {TaskModal} from './TaskModal'
import { EditableText } from './EditableText';
import { useState, useEffect } from 'react';
import { GetLocalToken } from '../utils/tokenUtils';

interface TaskItemProps {
  task: Task;
  onDataChanged: () => void;
  onDeleteTask?: (taskID: number) => void;
}

export function TaskItem({ task, onDeleteTask, onDataChanged }: TaskItemProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  const updateTaskName = async (newName: string) => {
    try {
      const patchResult = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GetLocalToken()}`
        },
        body: JSON.stringify({ name: newName })
      });

      if(patchResult.ok) {
        onDataChanged();
      }
    }
    catch(error) {
      console.error("Error updating task name:", error);
      alert("Server error");
    }
  }

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
