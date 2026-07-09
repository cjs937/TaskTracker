import type {User} from '../types'
import {mockProject, mockProject2} from './mockTasks'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'testuser',
    password: 'password',
    authority: 'user',
    projects: [mockProject, mockProject2]
  },
  {
    id: '2',
    name: 'testuser2',
    password: 'password',
    authority: 'user',
    projects: [mockProject2]
  }
]