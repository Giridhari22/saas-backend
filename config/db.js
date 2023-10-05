const mongoose = require("mongoose")
MONGO_URI = "mongodb+srv://testingsdd123:7gzT3hWagodO7imY@cluster0.joyjwpl.mongodb.net/saas?retryWrites=true&w=majority"
// const MONGO_URI = "mongodb://localhost:27017/saas"
const logger = require("../logger/logger")

const database =async () => {
     mongoose.connect(MONGO_URI,

        { useNewUrlParser : true ,useUnifiedTopology:true})
        .then(res=>{
            logger.log("DB Cone")
            console.log('Database connected')
        })
        .catch((err)=>{
            console.error(`Error connecting to the Database ${err}`)
        })
    }

    module.exports=database;