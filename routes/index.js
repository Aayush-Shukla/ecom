var express = require('express');
var router = express.Router();
var passport=require('passport');



const { check, validationResult } = require('express-validator');

const upload=require('../middleware/multer');


var home=require('../controllers/home')
var sellerRoutes=require('../controllers/seller')
var customerRoutes=require('../controllers/customer')
var accAction=require('../controllers/accountActions')
var checkType=require('../middleware/checkType')
var authentication=require('../middleware/authentication')


router.get('/',authentication.checkIfLoggedIn(),home.homepage);


router.get('/register',authentication.checkIfNotLoggedIn(), function(req, res, next) {
  res.render('register', { title: 'Registration' });
});

router.get('/search',authentication.checkIfLoggedIn(), function(req, res, next) {
  res.render('search', { title: 'Registration' });
});


router.get('/create',authentication.checkIfLoggedIn(),checkType.checkIfSeller(), function(req, res, next) {
  res.render('create');
});


router.get('/test',checkType.checkIfSeller(), function(req, res, next) {
  res.render('create');
});

router.post('/create',authentication.checkIfLoggedIn(),checkType.checkIfSeller(),upload.single('image'),sellerRoutes.newProd);


router.get('/login',authentication.checkIfNotLoggedIn(), function(req, res, next) {
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


router.get('/recent',authentication.checkIfLoggedIn(),checkType.checkIfSeller(),sellerRoutes.recent)


router.post('/update/:id',authentication.checkIfLoggedIn(),checkType.checkIfSeller(),sellerRoutes.updateQuant)



router.post('/updateprod/:id',authentication.checkIfLoggedIn(),checkType.checkIfSeller(),upload.single('image'),sellerRoutes.updateProd);


router.get('/cart',authentication.checkIfLoggedIn(),checkType.checkIfCustomer(),customerRoutes.getCart);


router.get('/cart/delete/:id',authentication.checkIfLoggedIn(),checkType.checkIfCustomer(), customerRoutes.delCartItem)


router.get('/cart/order',authentication.checkIfLoggedIn(),checkType.checkIfCustomer(), customerRoutes.makeOrder)


router.get('/edit/:id',authentication.checkIfLoggedIn(),checkType.checkIfSeller(), sellerRoutes.editPage)



router.get('/add/:id',authentication.checkIfLoggedIn(),checkType.checkIfCustomer(), customerRoutes.addToCart)


router.post('/login', passport.authenticate(
    'local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash : true
    }));

router.get('/logout', accAction.logout);



router.post('/register', check('username').not().isEmpty().withMessage('name cant be empty'),accAction.register);


router.post('/search',authentication.checkIfLoggedIn(),checkType.checkIfCustomer(), customerRoutes.searchItems);


passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {

        done(null, user_id);

});





module.exports = router;
