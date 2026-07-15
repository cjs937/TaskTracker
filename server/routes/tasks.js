const express = require('express');
const router = express.Router();
const { get, run, query } = require('../database');

//ADD
router.post("/", async (req, res) => {
    try {
        const {user, task} = req.body;
        

        await run(db, "INSERT INTO tasks ")
    }
    catch {

    }
});

//GET
router.get("/", async (req, res) => {

});

router.get("/:id", async (req, res) => {

});

//REMOVE
router.delete("/:id", async (req, res) => {

});

//UPDATE
router.patch("/:id", async (req, res) => {

});