const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const db = require('../config/db');
const path = require('path');

// router.use(express.static(__dirname));

router.route('/')
    .get((req, res)=>{
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    })


module.exports = router;