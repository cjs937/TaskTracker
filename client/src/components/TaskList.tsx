import type { TaskList as TaskListType } from '../types';
import { TaskItem } from './TaskItem';
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
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 min-w-64">
      <h2
        className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {taskList.name}
      </h2>
      { isExpanded && (
        tasks && tasks.length > 0 ?
          <div className="grid grid-cols-1 gap-2 mt-4">
            {tasks.map(currTask => (
              <TaskItem key={currTask.id} task={currTask} />
            ))}
          </div> :
          <div className="text-gray-500 mt-4">NO TASKS</div>
      )}
    </div>
  );
}
