const router = require("express").Router();
const product = require("../controller/product/product")
const { authMiddle } = require("../middlewares/middlewares/authorization")



router.post("/createProduct" ,authMiddle,product.createProduct)
router.post("/updateProduct/:id" ,authMiddle, product.updateProduct)
router.get("/getProducts",authMiddle, product.getProducts)
router.get("/getProductByOrganization/:organizationId",authMiddle, product.getProductByOrganization)
router.get("/getProductByCustomerId/:customerId",authMiddle, product.getProductByCustomerId)


router.delete("/deleteProducts/:id" ,authMiddle, product.deleteProducts)
// router.get("/searchProducts/:key", product.searchProducts)

module.exports = router