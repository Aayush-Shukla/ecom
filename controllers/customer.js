exports.getCart= function(req, res, next) {
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
}



exports.addToCart= function(req, res, next) {
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
}



exports.delCartItem=function(req, res, next) {
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



}


exports.makeOrder=function(req, res, next) {
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




}


exports.searchItems=function(req, res, next) {



    search='%'+req.body.search+'%'


    const db=require('../db.js')

    db.query("SELECT * FROM products WHERE (name LIKE (?) or description LIKE (?) or highlight LIKE (?)) AND quantity >0", [search,search,search], function (error, results, fields) {
        if (error) {
            console.log(error,'dbquery');
        }
        console.log(results)
        results.forEach(result=>result.highlight=JSON.parse(result.highlight))
        res.render('search',{data:{search_res:results,type:true}})


    })





}
