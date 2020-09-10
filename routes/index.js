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



                    db.query("SELECT customerId,productId,products.name as pname,users.name,email,time FROM delta.purchase INNER JOIN delta.products ON delta.purchase.productId = delta.products.id INNER JOIN  delta.users ON delta.purchase.customerId= delta.users.id WHERE seller_id=(?) AND time> date_sub(now(),Interval 1 month) ORDER BY time ASC ;",[profileid], function (error, gdata, fields) {
                        if (error) {
                            console.log(error, 'dbquery');
                        }

                        var now = new Date()
                        var temp = new Date(now.getTime());
                        console.log(now)
                        var before = new Date(temp.setMonth(temp.getMonth() - 1));
                        now = new Date(now.setDate(now.getDate() + 5));
                        // console.log(results[0].time,,tt,tt.toLocaleDateString('en-IN'))
                        console.log(gdata[0].time.toString())


                        arr = []
                        json = {}

                        for (var i = 0; i < gdata.length; i++) {
                            if (json.hasOwnProperty(gdata[i].time.toLocaleDateString('en-GB'))) {
                                json[gdata[i].time.toLocaleDateString('en-GB')]++
                            } else {
                                json[gdata[i].time.toLocaleDateString('en-GB')] = 1


                            }

                        }

                        Object.keys(json).forEach(key => {
                            // console.log(key, [key]);
                            arr.push({
                                x: key,
                                y: json[key]
                            })


                        });

                        // arr.push(json)
                        var val = [45, 25, 23, 12, 55, 75]
                        val = JSON.stringify(val)
                        var x = {}
                        x['data'] = arr
                        console.log(arr)

                        // arr=JSON.stringify(arr)
                        arr = JSON.stringify(arr)
                        // date=new Date()
                        // console.log(date.toLocaleDateString('en-GB'))
                        console.log(now, before)

                        res.render('home-seller', {data: {items: results, name: namese[0].name ,type:false,seller:true,chartData: arr,from:before.toLocaleDateString('en-IN'),to:now.toLocaleDateString('en-IN')}});

                    })




                })
            }
            else  {

                db.query("SELECT id, name,image,description,quantity,category,highlight FROM products order by category", function (error, results, fields) {
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
                    res.render('home-customer', {data: {items:sortedItems, name: namese[0].name ,type:true}});
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


router.get('/graph', function(req, res, next) {


    profileid=req.session.passport.user.user_id

    quantity = req.body.quantity
    prodid = req.params.id
    const db = require('../db.js')

    db.query("SELECT customerId,productId,products.name as pname,users.name,email,time FROM delta.purchase INNER JOIN delta.products ON delta.purchase.productId = delta.products.id INNER JOIN  delta.users ON delta.purchase.customerId= delta.users.id WHERE seller_id=(?) AND time> date_sub(now(),Interval 1 month) ORDER BY time ASC ;",[profileid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }

        var now=new Date()
        var temp=new Date(now.getTime());
        console.log(now)
        var before = new Date(temp.setMonth(temp.getMonth()-1));
        now = new Date(now.setDate(now.getDate()+5));
        // console.log(results[0].time,,tt,tt.toLocaleDateString('en-IN'))
        console.log(results[0].time.toString())



        arr=[]
        json={}

        for(var i=0;i<results.length;i++){
            if(json.hasOwnProperty(results[i].time.toLocaleDateString('en-GB'))){
                json[results[i].time.toLocaleDateString('en-GB')]++
            }
            else{
                json[results[i].time.toLocaleDateString('en-GB')]=1


            }

        }

        Object.keys(json).forEach(key => {
            // console.log(key, [key]);
            arr.push({
                x: key,
                y: json[key]
            })


        });

        // arr.push(json)
        var val = [45, 25, 23, 12, 55, 75]
        val = JSON.stringify(val)
        var x={}
            x['data']=arr
        console.log(arr)

        // arr=JSON.stringify(arr)
        arr=JSON.stringify(arr)
        // date=new Date()
        // console.log(date.toLocaleDateString('en-GB'))
        console.log(now,before)
        res.render('prodinfo', {data:{chartData: arr,from:before.toLocaleDateString('en-IN'),to:now.toLocaleDateString('en-IN')}});

    })
});





router.get('/recent',authenticationMiddleware(),checkSeller(),function(req,res,next) {

    profileid=req.session.passport.user.user_id

    quantity = req.body.quantity
    prodid = req.params.id
    const db = require('../db.js')
    db.query("SELECT customerId,productId,products.name as pname,users.name,email,time FROM delta.purchase INNER JOIN delta.products ON delta.purchase.productId = delta.products.id INNER JOIN  delta.users ON delta.purchase.customerId= delta.users.id WHERE seller_id=(?) ORDER BY time DESC",[profileid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        // console.log(results)
        data={}
        for(var i=0;i<results.length;i++){
            if(data.hasOwnProperty(results[i].name)){

                data[results[i].name].push(results[i])


            }
            else {
                data[results[i].name]=[]
                data[results[i].name].push(results[i])

            }


        }
        console.log(data)
        res.render('recent',{data:data})

    })
})







router.post('/update/:id',authenticationMiddleware(),checkSeller(),function(req,res,next){

    quantity=req.body.quantity
    prodid=req.params.id
    const db=require('../db.js')


    db.query("UPDATE products SET quantity = (?) where id = (?)",[quantity,prodid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }

        res.redirect('/')
    })


})




router.post('/updateprod/:id',authenticationMiddleware (), function(req, res, next) {


    console.log(req.body)

    productid=req.params.id
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

    db.query("update products set name=(?),image=(?),description=(?),quantity=(?),category=(?),highlight=(?),seller_id=(?) WHERE id=(?)", [product,image,description,quantity,category,highlight,sellerid,productid], function (error, results, fields) {
        if (error) {
            console.log(error,'dbquery');
        }
        console.log("success")
    })
    res.redirect('/')





});






router.get('/cart',authenticationMiddleware (),checkNotSeller(), function(req, res, next) {
    console.log(req.user, req.isAuthenticated())
    profileid = req.session.passport.user.user_id
    const db = require('../db.js')

    db.query("SELECT cart FROM users WHERE id=(?)", [profileid], function (error, result, fields) {
        if (error) {
            console.log(error, 'dbquery');

        }

        console.log(result,"===",result[0].cart)
        if (result[0].cart==undefined){
            cartParse=[]
        }
        else{
            cartParse=JSON.parse(result[0].cart)
        }

        console.log(cartParse,typeof cartParse,"-----------")

        db.query("SELECT * FROM  products where id in (?) ", [cartParse], function (error, result, fields) {
            if (error) {
                console.log(error, 'dbquery');

            }

            console.log(result)
            res.render('cart', {items: result})
        })

    })
});

router.get('/cart/delete/:id',authenticationMiddleware (),checkNotSeller(), function(req, res, next) {
    console.log(req.user, req.isAuthenticated())
    profileid = req.session.passport.user.user_id
    itemId=req.params.id

    const db = require('../db.js')
    db.query("SELECT cart FROM users WHERE id=(?)", [profileid], function (error, result, fields) {
        if (error) {
            console.log(error, 'dbquery');

        }


        cartParse=JSON.parse(result[0].cart)
        for (var i = 0; i < cartParse.length; i++)
            if (cartParse[i] == itemId) {
                cartParse.splice(i, 1);

            }

        cartParse=JSON.stringify(cartParse)
        db.query("UPDATE users SET cart = (?) where id = (?)",[cartParse,profileid], function (error, results, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }

            res.redirect('/cart')
        })


        // res.redirect('/cart')
    })



})


router.get('/cart/order',authenticationMiddleware (),checkNotSeller(), function(req, res, next) {
    console.log(req.user, req.isAuthenticated())
    profileid = req.session.passport.user.user_id

    const db = require('../db.js')

    db.query("SELECT cart FROM users WHERE id=(?)", [profileid], function (error, result, fields) {
        if (error) {
            console.log(error, 'dbquery');

        }
        cartParse = JSON.parse(result[0].cart)

        db.query("update products set quantity=quantity-1 where id in (?); update users set cart=NULL where id = (?)", [cartParse,profileid], function (error, result, fields) {
            if (error) {
                console.log(error, 'dbquery');

            }

            for(var i=0;i<cartParse.length;i++){

                db.query("INSERT INTO purchase (customerId,productId) VALUES ((?),(?))", [profileid,cartParse[i]], function (error, result, fields) {
                    if (error) {
                        console.log(error, 'dbquery');

                    }
                })

            }




            res.redirect('/')


        })

    })




})


router.get('/edit/:id',authenticationMiddleware (),checkSeller(), function(req, res, next) {
    console.log(req.user, req.isAuthenticated())
    profileid = req.session.passport.user.user_id

    const db = require('../db.js')

    prodId = req.params.id

    db.query("SELECT * FROM products WHERE id=(?)", [prodId], function (error, result, fields) {
        if (error) {
            console.log(error, 'dbquery');

        }
        if(result[0].seller_id==profileid){
            result[0].highlight=JSON.parse(result[0].highlight).join(';').toString()
        res.render('edit',{item:result[0]})

                console.log(result[0])
        }
        else{
            res.redirect('/')
        }
    })




})





router.get('/add/:id',authenticationMiddleware (),checkNotSeller(), function(req, res, next) {
    console.log(req.user, req.isAuthenticated())
    profileid = req.session.passport.user.user_id

    const db = require('../db.js')

    prodId=req.params.id
    console.log(prodId)

    db.query("SELECT cart FROM users WHERE id=(?)", [profileid], function (error, result, fields) {
        if (error) {
            console.log(error, 'dbquery');

                   }

        console.log(result,"===",result[0].cart)
        if (result[0].cart==undefined){
            cartParse=[]
        }
        else{
            cartParse=JSON.parse(result[0].cart)
        }
        // console.log(cartParse.indexOf(prodId))
        if(cartParse.indexOf(prodId) == -1) {
            cartParse.push(prodId)
        }
        console.log(cartParse,"-----------")
        cartParse=JSON.stringify(cartParse)
        db.query("UPDATE users SET cart =(?) WHERE id=(?) ", [cartParse,profileid], function (error, result, fields) {
            if (error) {
                console.log(error, 'dbquery');


            }

            res.redirect('/')

        })
    })
})










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
