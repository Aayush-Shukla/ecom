var express = require('express');
var router = express.Router();
var passport=require('passport');

const { check, validationResult } = require('express-validator');
var bcrypt=require('bcrypt');
const saltRounds=10;




router.get('/',authenticationMiddleware (), function(req, res, next) {
    console.log(req.user,req.isAuthenticated())
    profileid=req.session.passport.user.user_id

    const db=require('../db.js')


        db.query("SELECT name, type FROM users WHERE id=(?)", [profileid], function (error, namese, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }


            // console.log(results)
            if (namese[0].type == 'seller') {

                db.query("SELECT id, name,image,description,quantity,category,highlight FROM products WHERE seller_id=(?)  ", [profileid], function (error, results, fields) {
                    if (error) {
                        console.log(error, 'dbquery');
                    }

                    console.log(results,JSON.parse(JSON.stringify(results)))


                    res.render('home-seller', {data: {items: results, name: namese[0].name}});
                })
            }
            else  {

                db.query("SELECT name,image,description,quantity,category,highlight FROM products order by category", function (error, results, fields) {
                    if (error) {
                        console.log(error, 'dbquery');
                    }

                    results.forEach(result=>result.highlight=JSON.parse(result.highlight))

                    let sortedItems= {
                         electronics : results.filter(row => row.category == 'electronics'),
                         men : results.filter(row => row.category == 'men-f'),
                         women : results.filter(row => row.category == 'women-f'),
                         movies : results.filter(row => row.category == 'movies-tv'),
                         software : results.filter(row => row.category == 'software'),
                         beauty : results.filter(row => row.category == 'beauty'),
                         games : results.filter(row => row.category == 'games'),
                         computers : results.filter(row => row.category == 'computers'),
                         books : results.filter(row => row.category == 'books'),
                    }
                    console.log(sortedItems.books[0].highlight[0])
                    res.render('home-customer', {data: {items:sortedItems, name: namese[0].name}});
                })
            }



    })


});






router.get('/register',checkNotAuthenticated(), function(req, res, next) {
  res.render('register', { title: 'Registration' });
});

router.get('/search',authenticationMiddleware(), function(req, res, next) {
  res.render('search', { title: 'Registration' });
});


router.get('/create',authenticationMiddleware(),checkSeller(), function(req, res, next) {
  res.render('create');
});



router.get('/test',checkSeller(), function(req, res, next) {
  res.render('create');
});

router.get('/profile',authenticationMiddleware (), function(req, res, next) {
    authorid=req.session.passport.user.user_id

    const db=require('../db.js')
    db.query("SELECT * FROM post WHERE author_id =(?) ORDER BY created_at DESC", [authorid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        db.query("SELECT (Select count(*) from post where author_id=(?))as postno, (SELECT count(*) from followings where user_id=(?))as followers,(SELECT count(*) from followers where user_id=(?))as followings,(select name from users where id=(?))as name", [authorid,authorid,authorid,authorid], function (error, profinfo, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }
                console.log(results)
            db.query("SELECT * FROM users WHERE id =(?) ", [authorid], function (error, userdetail, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }
                console.log(userdetail[0])

                res.render('profile', {data: {userblogs: results, info: profinfo[0],userinfo: userdetail[0]}})
            })
        })
    })




});
router.post('/create',authenticationMiddleware (), function(req, res, next) {


    console.log(req.body)

    product=req.body.productname
    image= req.body.image
    description=req.body.description
    quantity=req.body.quantity
    category=req.body.category
    highlight=JSON.stringify(req.body.highlight.split(';'))
    // highlight=JSON.stringify(highlight.split(';')))

    sellerid=req.session.passport.user.user_id

    // console.log(JSON.parse(highlight)[0])

    const db=require('../db.js')

        db.query("INSERT INTO products(name,image,description,quantity,category,highlight,seller_id)VALUES(?,?,?,?,?,?,?)", [product,image,description,quantity,category,highlight,sellerid], function (error, results, fields) {
            if (error) {
                console.log(error,'dbquery');
            }
            console.log("success")
        })
        res.redirect('/')





});

router.get('/login',checkNotAuthenticated(), function(req, res, next) {
  res.render('login', { title: 'login' });
});

router.post('/update/:id',authenticationMiddleware(),checkSeller(),function(req,res,next){

    quantity=req.body.quantity
    prodid=req.params.id
    const db=require('../db.js')


    db.query("UPDATE products SET quantity = (?) where id = (?)",[quantity,prodid], function (error, followcheck, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }

        res.redirect('/')
    })


})


router.get('/user/:name',authenticationMiddleware (), function(req, res, next) {


    profilevisit=req.params.name
    currentuser=req.session.passport.user.user_id

    const db=require('../db.js')
    db.query("SELECT id FROM users WHERE name =(?) ", [profilevisit], function (error, profileid, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        // console.log(profileid[0].id)
        db.query("SELECT (Select count(*) from post where author_id=(?))as postno, (SELECT count(*) from followings where user_id=(?))as followers,(SELECT count(*) from followers where user_id=(?))as followings,(select name from users where id=(?))as name", [profileid[0].id,profileid[0].id,profileid[0].id,profileid[0].id], function (error, profinfo, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }
            db.query("SELECT content,created_at FROM post WHERE author_id =(?) ", [profileid[0].id], function (error, results, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }

                db.query("SELECT * from followers where user_id=(?) and follower_id=(?) ", [currentuser,profileid[0].id], function (error, followcheck, fields) {
                    if (error) {
                        console.log(error, 'dbquery');
                    }

                    console.log(followcheck.length==0,'cndn')
                    if(profileid[0].id==currentuser)
                    {
                        res.redirect('/profile')
                    }
                    else{
                    if (followcheck.length==0){
                        res.render('profile', {data: {userblogs: results, info: profinfo[0], id: profileid[0].id, alreaedyfollow:false}})

                    }
                    else {


                        res.render('profile', {data: {userblogs: results, info: profinfo[0], id: profileid[0].id, alreadyfollow:true}})
                    }}
                })
            })
        })
    })

});



router.get('/follow/:id',authenticationMiddleware (), function(req, res, next) {

    const db=require('../db.js')
    userid=req.session.passport.user.user_id
    tofollow=req.params.id
    db.query("INSERT INTO followings(following_id,user_id)VALUES (?,?)", [userid,tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
    })
        db.query("INSERT INTO followers(follower_id,user_id)VALUES(?,?)", [tofollow,userid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
    })

    db.query("SELECT name FROM users WHERE id=(?)", [tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        var redirect=results[0].name
        console.log(redirect)
        res.redirect(`/user/${redirect}`);

    })



});





router.get('/unfollow/:id',authenticationMiddleware (), function(req, res, next) {

    const db=require('../db.js')
    userid=req.session.passport.user.user_id
    tofollow=req.params.id
    db.query("DELETE FROM followings WHERE following_id=(?) AND user_id=(?)", [userid,tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
    })
    db.query("DELETE FROM followers WHERE follower_id=(?) AND user_id=(?)", [tofollow,userid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results,'del')
    })

    db.query("SELECT name FROM users WHERE id=(?)", [tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        var redirect=results[0].name
        console.log(redirect)
        res.redirect(`/user/${redirect}`);

    })



});





router.post('/login', passport.authenticate(
    'local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash : true
    }));

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/login')
});










router.post('/register', check('username').not().isEmpty().withMessage('name cant be empty'),function(req, res, next) {

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






});








router.post('/search',authenticationMiddleware (), function(req, res, next) {



    search='%'+req.body.search+'%'


    const db=require('../db.js')

    db.query("SELECT name,id FROM users WHERE name LIKE (?)", [search], function (error, results, fields) {
        if (error) {
            console.log(error,'dbquery');
        }
        console.log(results)
        res.render('search',{search_res:results})


    })





});






passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {

        done(null, user_id);

});
function authenticationMiddleware () {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) return next();
        res.redirect('/login')
    }
}
 function checkNotAuthenticated () {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) {
            res.redirect('/')
        }

        return next()
    }
}

function checkSeller () {
    return (req, res, next) => {
        const db=require('../db.js')
        var sellertype=''
        profileid=req.session.passport.user.user_id
        db.query("SELECT name, type FROM users WHERE id=(?)", [profileid], function (error, namese, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }
            console.log(namese[0].type)
            sellertype= namese[0].type=='seller'
            console.log(sellertype);

            console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`)
            console.log(sellertype,"---");

            if (sellertype) return next();
            res.redirect('/')


        })



    }
}
function checkNotSeller () {
    return (req, res, next) => {
        const db=require('../db.js')
        var sellertype=''
        profileid=req.session.passport.user.user_id
        db.query("SELECT name, type FROM users WHERE id=(?)", [profileid], function (error, namese, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }
            console.log(namese[0].type)
            sellertype= namese[0].type=='seller'
            console.log(sellertype);

            console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`)
            // console.log(sellertype,"---");

            if (sellertype) {
                res.redirect('/')
            }

            next()


        })



    }
}




module.exports = router;
