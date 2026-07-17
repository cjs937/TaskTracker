const express = require('express');
const router = express.Router();
const { get, run, query } = require('../database');
const { mapProject } = require("../utils/mappers");

//CREATE
router.post("/", async(req, res) => {
try {
    const { project, userID } = req.body;

    const ownerUser = await get(req.db, `SELECT * FROM users WHERE id = ?`, [userID]);
    if(!ownerUser)
        return res.status(400).json({error: `Invalid user ID (${userID}).`})
    if (!project.name) 
        return res.status(400).json({ error: "Missing required fields" });
    
    const sqlString = `INSERT INTO projects 
    (name, description, tags, user_id)
    VALUES(?, ?, ?, ?)`;

    const values = [
        project.name,
        project.description || null,
        JSON.stringify(project.tags || []),
        userID
    ];
    //const result = await run(req.db, sqlString, values);
    const projectID = (await run(req.db, sqlString, values)).id;
    const newProject = await get(req.db, `SELECT * FROM projects WHERE id = ?`, [projectID]);
    console.log("New project added:", newProject);
    
    return res.status(201).json(mapProject(newProject));
}
catch (error) {
    console.error("Error creating project.", error);
    return res.status(500).json({error: "Failed to create project"});
}

});
//READ
router.get("/", async (req, res) => {
try {
    const { name, tags, userID, inclusiveSearch } = req.query;
    const searchText = [];
    const params = [];

    if(name) {
        searchText.push(`name LIKE ?`);
        params.push(`%${name}%`);
    }

    if(tags) {
        searchText.push(`tags LIKE ?`);
        params.push(`%${JSON.stringify(tags)}%`);
    }

    if (userID) {
      searchText.push("user_id = ?");
      params.push(userID);
    }

    if(searchText.length === 0)
        return res.status(400).json({ error: "No search parameters provided"});

    const searchOperator = inclusiveSearch ? " AND " : " OR ";
    const sqlString = `SELECT * FROM projects WHERE ${searchText.join(searchOperator)}`;
    const searchResults = await query(req.db, sqlString, params);

    if(searchResults.length > 0)
        return res.status(200).json(searchResults.map(project => mapProject(project)));
    else
        return res.status(404).json({ message: "No projects found"});
}
catch (error) {
    console.error(`Error finding projects.`, error);
    return res.sendStatus(500);
}
});

router.get("/:id", async (req, res) => {
try {
    const requestedProject = await get(req.db, `SELECT * FROM projects WHERE id = ?`, [req.params.id]);
    
    if(requestedProject)
        return res.status(200).json(mapProject(requestedProject));
    else
        return res.status(404).json({message: "No project found"});
}
catch(error) {
    console.error(`Error finding project (${req.params.id}).`, error);
    return res.sendStatus(500);
}
});

//UPDATE
router.patch("/:id", async (req, res) => {
try {
    const targetProject = await get(req.db, `SELECT * FROM projects WHERE id = ?`, [req.params.id]);
    if(!targetProject)
        return res.status(404).json({ message: `Could not find project to update (${req.params.id})`});

    const { name, description, tags, userID } = req.body;
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

    if(tags) {
        updateText.push(`tags = ?`);
        params.push(JSON.stringify(tags));
    }

    if (userID) {
      updateText.push("user_id = ?");
      params.push(userID);
    }

    if(updateText.length === 0)
        return res.status(400).json({ error: "No data to update"});

    const sqlString = `UPDATE projects SET ${updateText.join(", ")} WHERE id = ?` 
    params.push(req.params.id);

    await run(req.db, sqlString, params);
    const fieldNames = updateText.map( item => item.split(" = ?")[0]);
    return res.status(200).json({ message: `Project fields updated successfully: ${fieldNames.join(", ")}`});
}
catch(error) {
    console.error(`Error updating project (${req.params.id})`, error);
    return res.status(500).json({error: "Failed to update project"});
}
});

//DELETE
router.delete("/:id", async (req, res) => {
try {
    const targetProject = await get(req.db, `SELECT * FROM projects WHERE id = ?`, [req.params.id]);
    if(!targetProject)
        return res.status(404).json({ message: `Could not find project to delete (${req.params.id})`});

    await run(req.db, `DELETE FROM projects WHERE id = ?`, [req.params.id]);
    return res.sendStatus(204);
}
catch(error) {
    console.error(`Error deleting project (${req.params.id})`, error);
    return res.status(500).json({error: "Failed to delete project"});}
});

module.exports = router;