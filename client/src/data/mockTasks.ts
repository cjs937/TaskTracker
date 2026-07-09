import type { Task, TaskList, Project } from '../types';

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

export const mockTasks2: Task[] = [
  {
    id: '1',
    title: 'Make more task lists',
    description: 'We need more tasks',
    completed: false,
    priority: 'high',
    dueDate: new Date('2026-07-01'),
    createdAt: new Date('2026-06-20'),
  }
];

export const mockTaskList: TaskList = {
  id: 'list-1',
  name: 'My Tasks',
  tasks: mockTasks,
};

export const mockTaskList2: TaskList = {
  id: 'list-2',
  name: 'Another Task List',
  tasks: mockTasks2,
};

export const mockProject: Project = {
  id: 'project-1',
  name: 'My Project',
  taskLists: [mockTaskList, mockTaskList2],
  tags: ['tag1', 'tag2']
}

export const mockProject2: Project = {
  id: 'project-2',
  name: 'My Project 2',
  taskLists: [mockTaskList2],
}