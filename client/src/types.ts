export interface Task {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  tags?: string[];
}

export interface TaskList {
  id: string;
  name: string;
  description?: string;
  tasks?: Task[];
}

export interface Project {
  id: string;
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