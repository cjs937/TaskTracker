import { useState } from 'react';
import type { TaskList } from '../types';
import type { Task } from '../types';
import { GetLocalToken } from '../utils/tokenUtils';
import { TaskModal } from './TaskModal';

interface SearchProps {
    show: boolean;
    onHide: () => void;
    taskLists: TaskList[];
}

interface SearchResult {
    task: Task;
    taskListName: string;
    taskListId: number;
}

export function Search({ show, onHide, taskLists }: SearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const searchForTasks = async (taskListId: number, searchString: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/tasks/?taskListID=${taskListId}&name=${searchString}&inclusiveSearch=true`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${GetLocalToken()}`}
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return [];
        }
        catch (error) {
            console.log("Error searching for tasks:", error);
            return [];
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        setHasSearched(true);
        setIsSearching(true);
        const allResults: SearchResult[] = [];

        for (const taskList of taskLists) {
            const tasks = await searchForTasks(taskList.id, searchTerm);
            tasks.forEach((task: Task) => {
                allResults.push({
                    task,
                    taskListName: taskList.name,
                    taskListId: taskList.id
                });
            });
        }

        setSearchResults(allResults);
        setIsSearching(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleTaskDataChanged = () => {
        handleSearch();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onHide}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search tasks..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {searchResults.length === 0 && !isSearching && hasSearched && searchTerm && (
                        <div className="text-gray-500 text-center">No results found</div>
                    )}
                    {searchResults.length === 0 && !isSearching && !hasSearched && (
                        <div className="text-gray-500 text-center">Enter a search term to find tasks</div>
                    )}
                    {searchResults.length > 0 && (
                        <div className="space-y-3">
                            {searchResults.map((result, index) => (
                                <div
                                    key={`${result.task.id}-${index}`}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setSelectedTask(result.task);
                                        setIsTaskModalOpen(true);
                                    }}
                                >
                                    <div className="font-semibold text-gray-800">{result.task.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {result.task.description || 'No description'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        List: {result.taskListName} • Priority: {result.task.priority}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onHide}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
            {selectedTask && (
                <TaskModal
                    taskItem={selectedTask}
                    show={isTaskModalOpen}
                    onDataChanged={handleTaskDataChanged}
                    onHide={() => setIsTaskModalOpen(false)}
                />
            )}
        </div>
    );
}
