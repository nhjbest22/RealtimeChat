const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const db = require('../config/db');
const path = require('path');

router.route('/register')
    .get((req, res)=>{
        console.log("회원가입 페이지 접속");
        res.sendFile(path.join(__dirname, '../register.html'));
    })
    .post(async (req, res, next)=>{
        console.log('회원가입 요청');
        const userid = req.body.userid;
        const password = req.body.password;
        const username = req.body.username;
        
        //비밀번호 암호화
        const salt = crypto.randomBytes(64).toString("base64");
        const hashedPassword = crypto.pbkdf2Sync(password , salt , 10000, 64, "sha512").toString("base64");
        
        const sql = 'INSERT INTO users (userid, password, salt, username) VALUES (?,?,?,?)';
        const params = [userid, hashedPassword, salt, username];
        
        db.query(sql, params, (error, result)=>{
            if(error){
                console.error(error);
            }else{
                console.log("회원가입 성공")
                // res.redirect('/auth/login')
            }
        });
        res.redirect('/auth/login');
    })


router.route('/id_confirm')
    .post((req, res)=>{
        const userid = req.body.userid;
        const sql = "SELECT * FROM users WHERE userid = ?";
        const params = [userid];

        db.query(sql, params, (error, result)=>{
            if(error){
                console.error(error);
                res.status(500).send("Internal Server Error");
            }else
                res.send({cnt: result.length});
        })
    })

router.route('/login')
    .get((req, res)=>{
        if(req.session.user) res.redirect('/');
        console.log("login 화면 진입");
        res.sendFile(path.join(__dirname, '../login.html'));
    })
    .post((req, res)=>{
         const userid = req.body.userid;
         const password = req.body.password;

         const sql = "SELECT * FROM users WHERE userid = ?";
         const params = [userid]
         db.query(sql, params, (err, result) =>{
            if(result.length){
                const salt = result[0].salt;
                const pw = result[0].password;
                const hashedPassword = crypto.pbkdf2Sync(password , salt , 10000, 64, "sha512").toString("base64");
                if(pw == hashedPassword){
                    req.session.user = {
                        authorized: true,
                        userid : userid,
                        username : result[0].username,
                    }
                    req.session.save(err =>{
                        if(err) console.error(err);
                    })
                    console.log("로그인 성공");
                    console.log(req.session);
                    res.redirect('/');
                }else{
                    console.log("비밀번호 불일치");
                    res.send("<script>alert('비밀번호가 일치하지 않습니다'); location = document.referrer; </script>");
                }
                
            } else{
                console.log("아이디 미발견")
                res.send("<script>alert('존재하지 않는 아이디입니다'); location = document.referrer; </script>");
            }
         });
    })

router.route('/logout')
    .get((req, res)=>{
        req.session.destroy((err)=>{
            if(err){
                console.log("로그아웃 중 에러가 발생하였습니다.");
            }
            else res.redirect('/auth/login');
        });
    })

module.exports = router;