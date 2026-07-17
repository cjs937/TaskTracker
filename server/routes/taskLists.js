//TODO: ADD AUTHENTICATION & AUTHORIZATION VALIDATION LAYERS TO THESE REQUESTS

const express = require('express');
const router = express.Router();
const { get, run, query } = require('../database');
const { mapTaskList } = require("../utils/mappers");

//ADD
router.post("/", async (req, res) => {
try {
    const { taskList, projectID } = req.body;

    const targetProject = await get(req.db, `SELECT * FROM projects WHERE id = ?`, [projectID]);
    if(!targetProject)
        return res.status(400).json({error: `Invalid project ID (${projectID}).`})
    if (!taskList.name || !projectID) 
        return res.status(400).json({ error: "Missing required fields" });
    
    const sqlString = `INSERT INTO task_lists 
    (name, description, project_id)
    VALUES(?, ?, ?)`;

    const values = [
        taskList.name,
        taskList.description || null,
        projectID
    ];
    const taskListID = (await run(req.db, sqlString, values)).id;
    
    const newTaskList = await get(req.db, `SELECT * FROM task_lists WHERE id = ?`, [taskListID]);
    console.log("New task list added:", newTaskList);

    return res.status(201).json(mapTaskList(newTaskList));
}
catch(error) {
    console.error("Error creating task list.", error);
    return res.status(500).json({error: "Failed to create task list"});
}
});

//GET
router.get("/", async (req, res) => {
try {
    const { name, projectID, inclusiveSearch } = req.query;
    const searchText = [];
    const params = [];

    if(name) {
        searchText.push(`name LIKE ?`);
        params.push(`%${name}%`);
    }

    if (projectID) {
      searchText.push("project_id = ?");
      params.push(projectID);
    }

    if(searchText.length === 0)
        return res.status(400).json({ error: "No search parameters provided"});

    const searchOperator = inclusiveSearch ? " AND " : " OR ";
    const sqlString = `SELECT * FROM task_lists WHERE ${searchText.join(searchOperator)}`;
    const searchResults = await query(req.db, sqlString, params);

    if(searchResults.length > 0)
        return res.status(200).json(searchResults.map(taskList => mapTaskList(taskList)));
    else
        return res.status(404).json({ message: "No task lists found"});
}
catch (error) {
    console.error(`Error finding task lists.`, error);
    return res.sendStatus(500);
}
});

router.get("/:id", async (req, res) => {
try {
    const requestedTaskList = await get(req.db, `SELECT * FROM task_lists WHERE id = ?`, [req.params.id]);
    
    if(requestedTaskList)
        return res.status(200).json(mapTaskList(requestedTaskList));
    else
        return res.status(404).json({message: "No task list found"});
}
catch(error) {
    console.error(`Error finding task list (${req.params.id}).`, error);
    return res.sendStatus(500);
}
});

//REMOVE
router.delete("/:id", async (req, res) => {
try {
    const targetTaskList = await get(req.db, `SELECT * FROM task_lists WHERE id = ?`, [req.params.id]);
    if(!targetTaskList)
        return res.status(404).json({ message: `Could not find task list to delete (${req.params.id})`});

    await run(req.db, `DELETE FROM task_lists WHERE id = ?`, [req.params.id]);
    return res.sendStatus(204);
}
catch(error) {
    console.error(`Error deleting task list (${req.params.id})`, error);
    return res.status(500).json({error: "Failed to delete task list"});}
});

//UPDATE
router.patch("/:id", async (req, res) => {
try {
    const targetTaskList = await get(req.db, `SELECT * FROM task_lists WHERE id = ?`, [req.params.id]);
    if(!targetTaskList)
        return res.status(404).json({ message: `Could not find task list to update (${req.params.id})`});

    const { name, description, projectID } = req.body;
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

    if (projectID) {
      updateText.push("project_id = ?");
      params.push(projectID);
    }

    if(updateText.length === 0)
        return res.status(400).json({ error: "No data to update"});

    const sqlString = `UPDATE task_lists SET ${updateText.join(", ")} WHERE id = ?` 
    params.push(req.params.id);

    await run(req.db, sqlString, params);
    const fieldNames = updateText.map( item => item.split(" = ?")[0]);
    return res.status(200).json({ message: `Task list fields updated successfully: ${fieldNames.join(", ")}`});
}
catch(error) {
    console.error(`Error updating task list (${req.params.id})`, error);
    return res.status(500).json({error: "Failed to update task list"});
}
});

module.exports = router;
