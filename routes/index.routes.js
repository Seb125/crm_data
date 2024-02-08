const router = require("express").Router();
const axios = require('axios');
const Data = require("../models/Data.model")
const { isAuthenticated } = require("../middleware/jwt.middleware");
const cron = require('node-cron');

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/getData" , isAuthenticated, async (req, res) => {
  try {
    const data = await Data.find();
    res.status(200).json({data: data})
  } catch (error) {
    console.log(error)
  }
})
 
module.exports = router;
