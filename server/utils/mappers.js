/**
 * mappers.js
 * 
 * Utility functions to convert database rows (snake_case) 
 * to API responses (camelCase) to match TypeScript interfaces
 */

function mapUser(user) {
    if(!user) return null;
    return {
        ...user,
        projects: user.projects ? user.projects.map(mapProject) : undefined
    };
}

function mapProject(project) {
    if (!project) return null;
    return {
        ...project,
        tags: project.tags ? JSON.parse(project.tags) : undefined,
        taskLists: project.task_lists ? project.task_lists.map(mapTaskList) : undefined
  };
}

function mapTaskList(taskList) {
    if(!taskList) return null;
    return {
        ...taskList,
        tasks: taskList.tasks ? taskList.tasks.map(mapTask) : undefined
    };
}

function mapTask(task) {
    if (!task) return null;
    return {
        ...task,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        createdAt: task.created_at,
        completed: task.completed === 1,
        tags: task.tags ? JSON.parse(task.tags) : undefined
  };
}

module.exports = {
  mapTask,
  mapTaskList,
  mapProject,
  mapUser
};