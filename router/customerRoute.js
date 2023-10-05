const router = require("express").Router();
// const { validate } = require("../validation/vlidateModel")
const customer = require("../controller/customer/customer")
const { authMiddle } = require("../middlewares/middlewares/authorization")



router.post("/createCustomer" ,customer.createCustomer)
router.post("/customer/login" , customer.loginCustomer)
router.get("/getCustomers",authMiddle, customer.getCustomers)
router.get("/getCustomer/:organizationId", authMiddle,customer.getCustomer)

router.post("/updateCustomer/:id" ,authMiddle, customer.updateCustomer)
router.delete("/deleteCustomer/:id" ,authMiddle, customer.deleteCustomer)
router.put("/updateStatus", customer.updateStatus)
router.get("/searchCustomer/:key", customer.searchCustomer)


module.exports = router