//TODO: ADD AUTHENTICATION & AUTHORIZATION VALIDATION LAYERS TO THESE REQUESTS

const express = require('express');
const router = express.Router();
const { get, run, query } = require('../database');
const { mapTask } = require("../utils/mappers");
const { authenticateJWT } = require("../utils/authentication");
//ADD
router.post("/", authenticateJWT, async (req, res) => {
try {
    const {task, taskListID} = req.body;

    const targetList = await get(req.db, `SELECT * FROM task_lists WHERE id = ?`, [taskListID]);
    if(!targetList)
        return res.status(400).json({error: `Invalid task list ID (${taskListID}).`})
    if (!task.name || !task.priority || !taskListID) 
        return res.status(400).json({ error: "Missing required fields" });
    
    const sqlString = `INSERT INTO tasks 
    (name, description, completed, priority, due_date, created_at, tags, task_list_id)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        task.name,
        task.description || null,
        0,
        task.priority || "low",
        null,
        new Date().toISOString(),
        JSON.stringify(task.tags || []),
        taskListID
    ];
    const taskID = (await run(req.db, sqlString, values)).id;
    
    const newTask = await get(req.db, `SELECT * FROM tasks WHERE id = ?`, [taskID]);
    console.log("New task added:", newTask);

    return res.status(201).json(mapTask(newTask));
}
catch(error) {
    console.error("Error creating task.", error);
    return res.status(500).json({error: "Failed to create task"});
}
});

//GET
router.get("/", authenticateJWT, async (req, res) => {
try {
    const { name, tags, completed, priority, taskListID, inclusiveSearch } = req.query;
    const searchText = [];
    const params = [];

    if(name) {
        searchText.push(`name LIKE ?`);
        params.push(`%${name}%`);
    }

    if(tags) {
        searchText.push(`tags = ?`);
        params.push(JSON.stringify(tags));
    }

    if (completed !== undefined) {
      searchText.push("completed = ?");
      params.push(completed ? 1 : 0);
    }
 
    if (priority) {
      searchText.push("priority = ?");
      params.push(priority);
    }
 
    if (taskListID) {
      searchText.push("task_list_ID = ?");
      params.push(taskListID);
    }

    if(searchText.length === 0)
        return res.status(400).json({ error: "No search parameters provided"});

    const searchOperator = inclusiveSearch ? " AND " : " OR ";
    const sqlString = `SELECT * FROM tasks WHERE ${searchText.join(searchOperator)}`;
    const searchResults = await query(req.db, sqlString, params);

    if(searchResults.length > 0)
        return res.status(200).json(searchResults.map(task => mapTask(task)));
    else
        return res.status(404).json({ message: "No tasks found"});
}
catch (error) {
    console.error(`Error finding tasks.`, error);
    return res.sendStatus(500);
}
});

router.get("/:id", authenticateJWT, async (req, res) => {
try {
    const requestedTask = await get(req.db, `SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    
    if(requestedTask)
        return res.status(200).json(mapTask(requestedTask));
    else
        return res.status(404).json({message: "No task found"});
}
catch(error) {
    console.error(`Error finding task (${req.params.id}).`, error);
    return res.sendStatus(500);
}
});

//REMOVE
router.delete("/:id", authenticateJWT, async (req, res) => {
try {
    const targetTask = await get(req.db, `SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    if(!targetTask)
        return res.status(404).json({ message: `Could not find task to delete (${req.params.id})`});

    await run(req.db, `DELETE FROM tasks WHERE id = ?`, [req.params.id]);
    return res.sendStatus(204);
}
catch(error) {
    console.error(`Error deleting task (${req.params.id})`, error);
    return res.status(500).json({error: "Failed to delete task"});}
});

//UPDATE
router.patch("/:id", authenticateJWT, async (req, res) => {
try {
    const targetTask = await get(req.db, `SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    if(!targetTask)
        return res.status(404).json({ message: `Could not find task to update (${req.params.id})`});

    const { name, description, completed, priority, dueDate, tags, taskListID } = req.body;
    const updateText = [];
    const params = [];

    if(name) {
        updateText.push(`name = ?`);
        params.push(name);
    }

    if(description) {
        updateText.push(`description = ?`);
        params.push(description);
    }

    if (completed !== undefined) {
      updateText.push("completed = ?");
      params.push(completed ? 1 : 0);
    }
 
    if (priority) {
      updateText.push("priority = ?");
      params.push(priority);
    }
    
    if (dueDate) {
      updateText.push("due_date = ?");
      params.push(JSON.stringify(dueDate));
    }
    
    if(tags) {
        updateText.push(`tags = ?`);
        params.push(JSON.stringify(tags));
    }

    if (taskListID) {
      updateText.push("task_list_id = ?");
      params.push(taskListID);
    }

    if(updateText.length === 0)
        return res.status(400).json({ error: "No data to update"});

    const sqlString = `UPDATE tasks SET ${updateText.join(", ")} WHERE id = ?` 
    params.push (req.params.id);

    await run(req.db, sqlString, params);
    const fieldNames = updateText.map( item => item.split(" = ?")[0]);
    return res.status(200).json({ message: `Task fields updated successfully: ${fieldNames.join(", ")}`});
}
catch(error) {
    console.error(`Error updating task (${req.params.id})`, error);
    return res.status(500).json({error: "Failed to update task"});
}
});

module.exports = router;