var mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
	
  insecureAuth : true
  
})

connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
})










connection.query(`CREATE TABLE users (id int unsigned NOT NULL AUTO_INCREMENT,name varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,email varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,pass varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,type varchar(45) DEFAULT NULL,cart json DEFAULT NULL,PRIMARY KEY (id),UNIQUE KEY id (id))`, function (error,results, fields) { 
if (error) throw error;  
});

connection.query(`CREATE TABLE purchase (id int NOT NULL AUTO_INCREMENT,customerId int DEFAULT NULL,productId int DEFAULT NULL,time datetime DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY (id))`, function (error, results, fields) {
  if (error) throw error;
  
});





connection.query(`CREATE TABLE products (id int NOT NULL AUTO_INCREMENT,name varchar(45) DEFAULT NULL,image varchar(50) DEFAULT NULL,description longtext,quantity int DEFAULT NULL,category varchar(45) DEFAULT NULL,highlight json DEFAULT NULL,seller_id int DEFAULT NULL,price int DEFAULT NULL,PRIMARY KEY (id))`, function (error, results, fields) {
  if (error) throw error;
  
});





console.log("All Table Created Successfuly")








module.exports = connection;
