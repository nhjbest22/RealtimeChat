const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');

router.route('/userList')
    .get(async(req, res, next)=>{
        const users = await db.querySync('SELECT userid, username FROM users');
        res.send(users);
    })

module.exports = router;