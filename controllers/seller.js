var fs = require('fs');
var sharp = require('sharp');
var path = require('path');


exports.recent=function(req,res,next) {

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
}
exports.updateQuant=function(req,res,next){

    quantity=req.body.quantity
    prodid=req.params.id
    const db=require('../db.js')


    db.query("UPDATE products SET quantity = (?) where id = (?)",[quantity,prodid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }

        res.redirect('/')
    })


}


exports.updateProd= function(req, res, next) {



    console.log(req.file)

    productid=req.params.id
    product=req.body.productname
    if(typeof req.file!=='undefined') {
        image = req.file.filename + '.' + req.file.originalname.split('.')[1]
    }
    else {
        image = 'default.png'
    }
    description=req.body.description
    quantity=req.body.quantity
    category=req.body.category
    price=req.body.price
    highlight=JSON.stringify(req.body.highlight.split(';'))
    // highlight=JSON.stringify(highlight.split(';')))

    sellerid=req.session.passport.user.user_id

    // console.log(JSON.parse(highlight)[0])

    const db=require('../db.js')

    db.query("update products set name=(?),image=(?),description=(?),quantity=(?),category=(?),highlight=(?),seller_id=(?),price=(?) WHERE id=(?)", [product,image,description,quantity,category,highlight,sellerid,price,productid], function (error, results, fields) {
        if (error) {
            console.log(error,'dbquery');
        }
        console.log("success")


        if(typeof req.file!=='undefined') {


            console.log("success")
            fs.readFile(req.file.path, function (err, data) {
                var imageName = req.file.filename + '.' + req.file.originalname.split('.')[1]
                // If there's an error
                if (!imageName) {
                    console.log("There was an error")
                    res.redirect("/");
                    res.end();
                } else {
                    var fullPath = path.join(__dirname, "..", "/public/images/uploads/fullsize/", imageName);
                    var thumbPath = path.join(__dirname, "..", "/public/images/uploads/thumbs/", imageName)
                    // write file to uploads/fullsize folder
                    fs.writeFile(fullPath, data, function (err) {


                        console.log(fullPath)
                        sharp(fullPath).resize(400, 400)
                            .jpeg({quality: 50}).toFile(thumbPath);

                        // res.render('index', { title: 'Image Upload',message:'Image uploaded' })

                        res.redirect('/');


                    });
                }
            });
        }
        else{
            res.redirect('/')
        }
    })
    // res.redirect('/')





}




exports.editPage=function(req, res, next) {
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




}




exports.newProd=function(req, res, next) {


    console.log(req.file)

    product=req.body.productname
    if(typeof req.file!=='undefined') {
        image = req.file.filename + '.' + req.file.originalname.split('.')[1]
    }
    else {
        image = 'default.png'
    }
    description=req.body.description
    quantity=req.body.quantity
    category=req.body.category
    highlight=JSON.stringify(req.body.highlight.split(';'))
    price=req.body.price
    // highlight=JSON.stringify(highlight.split(';')))

    sellerid=req.session.passport.user.user_id

    // console.log(JSON.parse(highlight)[0])

    const db=require('../db.js')

    db.query("INSERT INTO products(name,image,description,quantity,category,highlight,seller_id,price)VALUES(?,?,?,?,?,?,?,?)", [product,image,description,quantity,category,highlight,sellerid,price], function (error, results, fields) {
        if (error) {
            console.log(error,'dbquery');
        }
        console.log("success")

        if(typeof req.file!=='undefined') {
            fs.readFile(req.file.path, function (err, data) {
                var imageName = req.file.filename + '.' + req.file.originalname.split('.')[1]
                // If there's an error
                if (!imageName) {
                    console.log("There was an error")
                    res.redirect("/");
                    res.end();
                } else {
                    var fullPath = path.join(__dirname, "..", "/public/images/uploads/fullsize/", imageName);
                    var thumbPath = path.join(__dirname, "..", "/public/images/uploads/thumbs/", imageName)
                    // write file to uploads/fullsize folder
                    fs.writeFile(fullPath, data, function (err) {


                        console.log(fullPath)
                        sharp(fullPath).resize(400, 400)
                            .jpeg({quality: 50}).toFile(thumbPath);

                        // res.render('index', { title: 'Image Upload',message:'Image uploaded' })

                        res.redirect('/');


                    });
                }
            });

        }
        else{
            res.redirect('/')
        }



    })
    // res.redirect('/')





}