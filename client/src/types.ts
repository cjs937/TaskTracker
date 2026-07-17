export interface Task {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  tags?: string[];
}

export interface TaskList {
  id: number;
  name: string;
  description?: string;
  tasks?: Task[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  taskLists?: TaskList[];
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  password: string;
  authority: "admin" | "user" | "viewer" 
  projects?: Project[];
}