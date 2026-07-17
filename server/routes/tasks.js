//TODO: ADD AUTHENTICATION & AUTHORIZATION VALIDATION LAYERS TO THESE REQUESTS

const express = require('express');
const router = express.Router();
const { get, run, query } = require('../database');
const { mapTask } = require("../utils/mappers");

//ADD
router.post("/", async (req, res) => {
try {
    const {task, task_list_id} = req.body;

    if (!task.name || !task.priority || !task.createdAt || !task_list_id) 
        return res.status(400).json({ error: "Missing required fields" });
    
    const sqlString = `INSERT INTO tasks 
    (name, description, completed, priority, due_date, created_at, tags, task_list_id)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        task.name,
        task.description || null,
        0,
        task.priority,
        task.dueDate?.toISOString() || null,
        task.createdAt.toISOString(),
        JSON.stringify(task.tags || []),
        task_list_id
    ];
    const taskID = await run(req.db, sqlString, values).id;
    
    const newTask = await get(req.db, `SELECT * FROM tasks WHERE id = ?`, [taskID]);
    return res.status(201).json(mapTask(newTask));
}
catch(error) {
    console.error("Error creating task.", error);
    return res.status(500).json({error: "Failed to create task"});
}
});

//GET
router.get("/", async (req, res) => {
try {
    const { name, tags, completed, priority, task_list_id, inclusiveSearch } = req.query;
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
 
    if (task_list_id) {
      searchText.push("task_list_id = ?");
      params.push(task_list_id);
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

router.get("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
router.patch("/:id", async (req, res) => {
try {
    const targetTask = await get(req.db, `SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    if(!targetTask)
        return res.status(404).json({ message: `Could not find task to update (${req.params.id})`});

    const { name, tags, completed, priority, task_list_id } = req.body;
    const updateText = [];
    const params = [];

    if(name) {
        updateText.push(`name = ?`);
        params.push(name);
    }

    if(tags) {
        updateText.push(`tags = ?`);
        params.push(JSON.stringify(tags));
    }

    if (completed !== undefined) {
      updateText.push("completed = ?");
      params.push(completed ? 1 : 0);
    }
 
    if (priority) {
      updateText.push("priority = ?");
      params.push(priority);
    }
 
    if (task_list_id) {
      updateText.push("task_list_id = ?");
      params.push(task_list_id);
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