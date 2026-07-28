import type { TaskList as TaskListType } from '../types';
import { TaskItem } from './TaskItem';
import { EditableText } from './EditableText';
import { useState, useEffect } from 'react';
import { GetLocalToken } from '../utils/tokenUtils';
import type {Task} from "../types"

interface TaskListProps {
  taskList: TaskListType;
  onDataChanged: () => void;
  onDeleteTaskList?: (taskListID: number) => void;
}

export function TaskList({ taskList, onDataChanged, onDeleteTaskList }: TaskListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const addNewTask = async () => {
    try {
      const postResult = await fetch("http://localhost:3001/api/tasks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GetLocalToken()}`
        },
        body: JSON.stringify({ task: { name: "New Task", description: "Add description...", priority: "Low" }, taskListID: taskList.id })
      });

      if(postResult.ok) {
        const newTask = await postResult.json();
        setTasks([...tasks, newTask]);
      }
    }
    catch(error) {
      console.error("Error creating task:", error);
      alert("Server error");
    }
  }

  const deleteTask = async (taskID: number) => {
    try {
      const deleteResult = await fetch(`http://localhost:3001/api/tasks/${taskID}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${GetLocalToken()}`
        }
      });

      if(deleteResult.ok) {
        setTasks(tasks.filter(task => task.id !== taskID));
      }
    }
    catch(error) {
      console.error("Error deleting task:", error);
      alert("Server error");
    }
  }

  const updateTaskListName = async (newName: string) => {
    try {
      const patchResult = await fetch(`http://localhost:3001/api/taskLists/${taskList.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GetLocalToken()}`
        },
        body: JSON.stringify({ name: newName })
      });

      if(patchResult.ok) {
        refreshTaskData();
      }
    }
    catch(error) {
      console.error("Error updating task list name:", error);
      alert("Server error");
    }
  }

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

  const refreshTaskData = async () => {
    await onDataChanged();
  }

  useEffect( () => {
    getTasks();
  },[taskList.id]);

  useEffect( () => {
    getTasks();
  },[taskList]);

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-4 min-w-64">
      <div className="flex justify-between items-center">
        <div
          className="flex-1 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        >
          <EditableText
            value={taskList.name}
            onSave={updateTaskListName}
            className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
          />
        </div>
        {onDeleteTaskList && (
          <button
            onClick={() => onDeleteTaskList(taskList.id)}
            className="text-red-500 hover:text-red-700 transition-colors text-sm pl-4"
          >
            Delete
          </button>
        )}
      </div>
      { isExpanded && (
        tasks && tasks.length > 0 ?
          <div className="grid grid-cols-1 gap-2 mt-4">
            {tasks.map(currTask => (
              <TaskItem key={currTask.id} task={currTask} onDataChanged={refreshTaskData} onDeleteTask={deleteTask} />
            ))}
            <div
              className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors text-center"
              onClick={addNewTask}
            >
              + Add Task
            </div>
          </div> :
          <div className="text-gray-500 mt-4">
            NO TASKS
            <div
              className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors text-center mt-2"
              onClick={addNewTask}
            >
              + Add Task
            </div>
          </div>
      )}
    </div>
  );
}