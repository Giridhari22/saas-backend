const router = require("express").Router()
const admin = require("../controller/admin/admin")
const apiLimit = require('../middlewares/middlewares/apiLimit');


router.post("/createAdmin",admin.createAdmin )
router.post("/admin/login",apiLimit,admin.loginAdmin )




module.exports = router