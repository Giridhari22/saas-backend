const router = require("express").Router();
const { validate } = require("../validation/vlidateModel")
const organization = require("../controller/organization/organization")
const { authMiddle } = require("../middlewares/middlewares/authorization")

router.post("/addOrganization" ,organization.createOrganization)
router.post("/organization/login" , organization.loginOrganization)
router.get("/getOrganization/:id",authMiddle, organization.getOrganization)
router.get("/getAllOrganization", organization.getAllOrganization)
router.post("/updateOrganization/:id" ,authMiddle, organization.updateOrganization)
router.put("/organization/updateStatus" ,authMiddle, organization.updateStatus)
router.delete("/deleteOrganization/:id" ,authMiddle, organization.deleteOrganization)
// router.get("/searchOrganization/:key", organization.searchOrganization)
router.get("/sortOrganization/sortBy", organization.sortOrganization)


module.exports = router