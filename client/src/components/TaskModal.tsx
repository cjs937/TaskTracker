import type { Task, TaskList } from "../types";
import { useState, useEffect, useRef } from "react";
import { GetLocalToken } from '../utils/tokenUtils';
import { EditableText } from './EditableText';

interface TaskModalProps {
    taskItem: Task;
    show: boolean;
    onDataChanged: () => void;
    onHide: () => void;
}

export function TaskModal({taskItem, show, onDataChanged, onHide}:TaskModalProps)
{
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [altTaskLists, setAltLists] = useState<TaskList[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
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
                console.log("Task data patch successful");
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
                console.log("Getting alt task lists");
                const taskListResult = await fetch(`http://localhost:3001/api/taskLists/${taskItem.taskListID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${GetLocalToken()}`}
                });

                let resultData = await taskListResult.json();

                if(!taskListResult.ok) {
                    console.log("Error getting current task list:", resultData.error);
                    return;
                }
                console.log("Task list request results:", resultData);
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

                setAltLists(altLists.filter((list) =>  list.id !== taskItem.taskListID ));
                console.log("Alt lists:", altTaskLists);
            }
            catch(error) {
                console.error("Error getting alternative task lists:", error);
                alert("Server error");
            }
        }

        getAltTaskLists();
    }, [taskItem.taskListID]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onHide}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <EditableText
                            value={taskItem.name}
                            onSave={updateTaskName}
                            className="text-2xl font-semibold text-gray-800 block"
                        />
                        <div className="flex gap-2 mt-2">
                            <EditableText
                                value={taskItem.priority}
                                onSave={updateTaskPriority}
                                className="bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm"
                            />
                            <span className="bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm">{new Date(taskItem.createdAt).toDateString()}</span>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => { setDropdownOpen(!isDropdownOpen); console.log("Dropdown clicked, current state:", isDropdownOpen);}}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                <span className="text-gray-700">Dropdown</span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                        {altTaskLists.map(list => (
                                            <button
                                                key={list.id}
                                                onClick={() => {
                                                    updateTaskData(null, null, null, null, null, list.id);
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
                        </div>
                    </div>
                    <button
                        onClick={onHide}
                        className="text-gray-500 hover:text-gray-700 transition-colors text-2xl font-light"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6">
                    <EditableText
                        value={taskItem.description || ""}
                        onSave={updateTaskDescription}
                        isMultiline={true}
                        showButtons={true}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button className="bg-white border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                        Tags
                    </button>
                    <button className="bg-red-500 text-white border-2 border-red-600 rounded-lg px-4 py-2 cursor-pointer hover:bg-red-600 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}