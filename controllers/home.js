

exports.homepage= function(req, res, next) {
    // console.log(req.user,req.isAuthenticated())
    profileid=req.session.passport.user.user_id

    const db=require('../db.js')


    db.query("SELECT name, type FROM users WHERE id=(?)", [profileid], function (error, namese, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }


        // console.log(results)
        if (namese[0].type == 'seller') {

            db.query("SELECT id, name,image,price,description,quantity,category,highlight FROM products WHERE seller_id=(?)  ", [profileid], function (error, results, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }

                console.log(results,JSON.parse(JSON.stringify(results)))



                db.query("SELECT customerId,productId,products.name as pname,users.name,email,price,time FROM delta.purchase INNER JOIN delta.products ON delta.purchase.productId = delta.products.id INNER JOIN  delta.users ON delta.purchase.customerId= delta.users.id WHERE seller_id=(?) AND time> date_sub(now(),Interval 1 month) ORDER BY time ASC ;",[profileid], function (error, gdata, fields) {
                    if (error) {
                        console.log(error, 'dbquery');
                    }

                    var now = new Date()
                    var temp = new Date(now.getTime());
                    console.log(now)
                    var before = new Date(temp.setMonth(temp.getMonth() - 1));
                    now = new Date(now.setDate(now.getDate() + 5));
                    // console.log(results[0].time,,tt,tt.toLocaleDateString('en-IN'))
                    // console.log(gdata[0].time.toString())


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

            db.query("SELECT id, name,image,description,price,quantity,category,highlight FROM products where quantity>0 order by category ", function (error, results, fields) {
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
                // console.log(sortedItems.books[0].highlight[0])
                res.render('home-customer', {data: {items:sortedItems, name: namese[0].name ,type:true}});
            })
        }



    })


}