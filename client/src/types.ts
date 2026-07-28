export interface Task {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  tags?: string[];
  taskListID: number;
}

export interface TaskList {
  id: number;
  name: string;
  description?: string;
  tasks?: Task[];
  projectID: number;
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
  authority: "admin" | "user" | "viewer" 
  projects?: Project[];
}