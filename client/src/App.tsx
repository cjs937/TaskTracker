import { useState } from 'react'
import { mockProject, mockTaskList } from './data/mockTasks'
import { TaskList } from './components/TaskList'
import { Project } from './components/Project'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {
        <Project key={mockProject.id} project={mockProject} />
        /* <TaskList key={mockTaskList.id} taskList={mockTaskList} /> */
      }
    </>
  )
}

export default App
