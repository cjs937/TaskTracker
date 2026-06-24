export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
}

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: Date;
}