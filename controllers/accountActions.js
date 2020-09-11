var bcrypt=require('bcrypt');
const saltRounds=10;

exports.logout=function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/login')
}

exports.register=function(req, res, next) {

    exist=[]
    console.log(req.body)
    username=req.body.username
    email=req.body.email
    pword=req.body.password
    type=req.body.type
    const db=require('../db.js')
    db.query("SELECT * FROM users WHERE name=(?) OR email =(?)",[username,email],function (error,existresult,fields){



        if (existresult.length!=0) {
            // return res.status(422).json({ errors: errors.array() });
            res.render('register', { title: 'Registration error' ,errors :'Username not available OR Email exists'});
        }
        else{

            bcrypt.hash(pword,saltRounds,function(err,hash) {
                db.query("INSERT INTO users(name,email,pass,type)VALUES(?,?,?,?)", [username, email, hash, type], function (error, results, fields) {
                    if (error) {
                        console.log(error,'dbquery');
                    }

                    db.query('SELECT LAST_INSERT_ID() as user_id',function(error,results,fields){
                        if(error) {
                            console.log(error)
                        }
                        console.log(results[0])
                        const user_id=results[0]
                        req.login(user_id,function(err){
                            res.redirect('/');

                        })
                    })



                })
            })
        }









    })






}