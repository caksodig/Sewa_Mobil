
const mysql = require("mysql")
// mysql connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "rent_car"
})

module.exports=db