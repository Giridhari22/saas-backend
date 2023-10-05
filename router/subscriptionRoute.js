const router = require("express").Router();

const Subscription = require("../controller/subscription/subscription");
const { authMiddle } = require("../middlewares/middlewares/authorization");

router.post("/createSubscription",authMiddle ,Subscription.createSubscription)
router.get("/getSubscription" ,Subscription.getSubscription)
router.get("/getSingleSubscription/:id",authMiddle, Subscription.getSingleSubscription)
router.post("/updateSubscription/:id" , authMiddle,Subscription.updateSubscription)
router.delete("/deleteSubscription/:id" ,authMiddle,Subscription.deleteSubscription )
router.put("/Subscription/updateStatus" ,Subscription.updateStatus )



module.exports = router