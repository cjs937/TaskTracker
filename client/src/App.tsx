import { useState } from 'react'
import { mockTaskList } from './data/mockTasks'
import { TaskList } from './components/TaskList'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TaskList key={mockTaskList.id} taskList={mockTaskList} />
    </>
  )
}

export default App
