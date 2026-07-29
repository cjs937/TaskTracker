import type { Task, TaskList } from "../types";
import { useState, useEffect, useRef } from "react";
import { GetLocalToken } from '../utils/tokenUtils';
import { EditableText } from './EditableText';

interface TaskModalProps {
    taskItem: Task;
    show: boolean;
    onDataChanged: () => void;
    onHide: () => void;
    onDeleteTask?: (taskID: number) => void;
}

export function TaskModal({taskItem, show, onDataChanged, onHide, onDeleteTask}:TaskModalProps)
{
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isPriorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
    const [altTaskLists, setAltLists] = useState<TaskList[]>([]);
    const [ownerListName, setOwnerName] = useState("");
    const [currentTaskListID, setCurrentTaskListID] = useState(taskItem.taskListID);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const priorityDropdownRef = useRef<HTMLDivElement>(null);
    
    const updateTaskData = async (nameUpdate = null, descUpdate = null,
        completeUpdate = null, prioUpdate = null, dueDateUpdate = null, listIDUpdate = null) => {
        try {
            const body: any = {};
            if (nameUpdate !== null) body.name = nameUpdate;
            if (descUpdate !== null) body.description = descUpdate;
            if (completeUpdate !== null) body.completed = completeUpdate;
            if (prioUpdate !== null) body.priority = prioUpdate;
            if (dueDateUpdate !== null) body.dueDate = dueDateUpdate;
            if (listIDUpdate !== null) body.taskListID = listIDUpdate;

            const patchResult = await fetch(`http://localhost:3001/api/tasks/${taskItem.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GetLocalToken()}`
                    },
                    body: JSON.stringify(body)
            });

            if(patchResult.ok) {
                onDataChanged();
            } else {
                const errorData = await patchResult.json();
                console.error("Error updating task:", errorData.error);
            }
        }
        catch (error) {
            console.error("Error updating task data:", error);
        }
    }

    const updateTaskName = (newName: string) => {
        updateTaskData(newName, null, null, null, null, null);
    }

    const updateTaskDescription = (newDesc: string) => {
        updateTaskData(null, newDesc, null, null, null, null);
    }

    const updateTaskPriority = (newPriority: string) => {
        updateTaskData(null, null, null, newPriority, null, null);
    }

    const updateTaskList = (newListID: number) => {
        updateTaskData(null, null, null, null, null, newListID);
        setCurrentTaskListID(newListID);
    }

    useEffect(() => {
        setCurrentTaskListID(taskItem.taskListID);
    }, [taskItem.taskListID]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
                setPriorityDropdownOpen(false);
            }
        };

        if (isPriorityDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isPriorityDropdownOpen]);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    useEffect(() => {
        const getAltTaskLists = async () => {
            try {
                const taskListResult = await fetch(`http://localhost:3001/api/taskLists/${taskItem.taskListID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${GetLocalToken()}`}
                });

                let resultData = await taskListResult.json();

                if(!taskListResult.ok) {
                    console.log("Error getting current task list:", resultData.error);
                    return;
                }
                const projectID = resultData.projectID;

                const altListsResults = await fetch(`http://localhost:3001/api/taskLists/?projectID=${projectID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${GetLocalToken()}`}
                });

                resultData = await altListsResults.json();

                if(!altListsResults.ok){
                    console.log("Error finding alt lists:", resultData.error);
                    return;
                }
                const altLists = resultData as TaskList[];

                const ownerList = altLists.find(list => list.id === currentTaskListID);
                if (ownerList) setOwnerName(ownerList.name);
                setAltLists(altLists.filter(list => list.id !== currentTaskListID));
            }
            catch(error) {
                console.error("Error getting alternative task lists:", error);
                alert("Server error");
            }
        }

        getAltTaskLists();
    }, [currentTaskListID, show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onHide}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Row 1: title + close button */}
                <div className="flex justify-between items-start gap-4 px-6 pt-6 pb-3">
                    <EditableText
                        value={taskItem.name}
                        onSave={updateTaskName}
                        className="text-2xl font-semibold text-gray-800 block"
                    />
                    <button
                        onClick={onHide}
                        className="text-gray-500 hover:text-gray-700 transition-colors text-2xl font-light flex-shrink-0"
                    >
                        ×
                    </button>
                </div>

                {/* Row 2: dropdown (left) + priority & date grouped (right) */}
                <div className="flex justify-between items-center px-6 pb-6 border-b border-gray-200">
                    <div className="relative bg-gray-100 border border-gray-300 rounded" ref={dropdownRef}>
                        <button
                            onClick={() => { if(altTaskLists.length > 0) setDropdownOpen(!isDropdownOpen);}}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-gray-700">{ownerListName}</span>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {altTaskLists.map(list => (
                                    <button
                                        key={list.id}
                                        onClick={() => {
                                            updateTaskList(list.id);
                                            setDropdownOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        {list.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative bg-gray-100 border border-gray-300 rounded" ref={priorityDropdownRef}>
                            <button
                                onClick={() => setPriorityDropdownOpen(!isPriorityDropdownOpen)}
                                className="flex items-center justify-center gap-2 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                            >
                                <span className="text-sm text-center">Priority: {taskItem.priority}</span>
                            </button>
                            {isPriorityDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg"> 
                                    {['Low', 'Medium', 'High'].map(priority => (
                                        <button
                                            key={priority}
                                            onClick={() => {
                                                updateTaskPriority(priority);
                                                setPriorityDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="relative bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm text-center">
                            Created: {new Date(taskItem.createdAt).toDateString()}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    <EditableText
                        value={taskItem.description || ""}
                        onSave={updateTaskDescription}
                        isMultiline={true}
                        showButtons={true}
                        className="min-w-[450px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button className="bg-red-500 text-white border-2 border-red-600 rounded-lg px-4 py-2 cursor-pointer hover:bg-red-600 transition-colors" 
                        onClick={()=> onDeleteTask(taskItem.id)}> 
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}