import type { Task, TaskList } from '../types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Learn React basics',
    description: 'Complete the official React tutorial',
    completed: false,
    priority: 'high',
    dueDate: new Date('2026-07-01'),
    createdAt: new Date('2026-06-20'),
  },
  {
    id: '2',
    title: 'Build task tracker app',
    description: 'Create a simple task management application',
    completed: false,
    priority: 'medium',
    dueDate: new Date('2026-07-15'),
    createdAt: new Date('2026-06-22'),
  },
  {
    id: '3',
    title: 'Review TypeScript types',
    description: 'Practice defining interfaces and types',
    completed: true,
    priority: 'low',
    createdAt: new Date('2026-06-18'),
  },
];

export const mockTaskList: TaskList = {
  id: 'list-1',
  name: 'My Tasks',
  tasks: mockTasks,
  createdAt: new Date('2026-06-22'),
};
