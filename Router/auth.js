const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const crypto = require("crypto");
const db = require('../config/db');
const path = require('path');

router.route('/register')
    .get((req, res)=>{
        console.log("get 진입")
        res.sendFile(path.join(__dirname, '../register.html'));
    })
    .post(async (req, res, next)=>{
        console.log('회원가입 요청');
        const userid = req.body.userid;
        const password = req.body.password;
        const password2 = req.body.password2;
        const username = req.body.username;
        if(password != password2){
            res.status(500).send("비밀번호가 일치하지 않습니다.");
        }

        //비밀번호 암호화
        const salt = crypto.randomBytes(64).toString("base64");
        const hashedPassword = crypto.pbkdf2Sync(password , salt , 100000, 64, "sha512").toString("base64");
        const sql = 'INSERT INTO users (userid, password, salt, username) VALUES (?,?,?,?)';
        const params = [userid, hashedPassword, salt, username];
        
        db.query(sql, params, (error, result)=>{
            if(error){
                console.error(error);
                res.status(500).send("회원가입 실패")
            }else
                res.status(300).send("회원가입 성공");
        });
    })


router.route('/login')
    .get((req, res)=>{
        res.sendFile(path.join(__dirname, '../main.html'));
    })
    .post((req, res)=>{
         
    })

module.exports = router;