require('dotenv').config()
const express = require("express");
const cors = require("cors");
const server = express();
const bodyParser = require('body-parser'); 
PORT = process.env.PORT;
const database =  require("./config/db")


server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json())
server.use(express.urlencoded({ extended: false }));
server.use(cors())
server.use("/", require("./router/adminRoute"))
server.use("/", require("./router/organizationRoute"))
server.use("/", require("./router/subscriptionRoute"))
server.use("/", require("./router/customerRoute"))
server.use("/", require("./router/productRoute"))



database()

server.listen(PORT , ()=>{
    console.log(`listening on ${ PORT }`)
})