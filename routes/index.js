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



router.post('/register',[check("password", "Password should not be empty, minimum eight characters, at least one Capital letter, one number and one special character").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,)],accAction.register);


router.post('/search',authentication.checkIfLoggedIn(),checkType.checkIfCustomer(), customerRoutes.searchItems);


passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {

        done(null, user_id);

});





module.exports = router;
