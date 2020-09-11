exports.checkIfSeller=function() {
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
exports.checkIfCustomer=function () {
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
