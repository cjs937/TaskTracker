import type { Task } from "../types";
import { useEffect } from "react";

interface TaskModalProps {
    taskItem: Task;
    show: boolean;
    onHide: () => void;
}

export function TaskModal({taskItem, show, onHide}:TaskModalProps)
{
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

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onHide}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800">{taskItem.name}</h2>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm">{taskItem.priority}</span>
                            <span className="bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm">{new Date(taskItem.createdAt).toDateString()}</span>
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
                    <input
                        type="text"
                        defaultValue={taskItem.description}
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