const Subscription = require("../../model/subscription");

exports.createSubscription = async(req,res)=>{
    try {
        const {name , price} = req.body
        const subscription = new Subscription({name , price})
        if(subscription){
            await subscription.save();
            res.status(201).json({
                success: true,
                data: subscription,
              });
        }else{
            res.status(201).json({
                success: false,
                msg:"can't create subscription",
              });
        }
    } catch (error) {
        res.status(500).json({
      success: false,
      error: error.message,
    });
    }
}


exports.getSubscription = async (req, res) => {

  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.rowsPerPage) || 5;

  const orderBy = req.query.orderBy || "createdAt"
  const order = req.query.order || "desc"

  const orderWith = order == "desc"? -1:1

    try {
      const subscriptions = await Subscription.find({})
      .sort({ [orderBy]: orderWith })
      .skip((page) * perPage)
      .limit(perPage);
  
    const totalUsers = await Subscription.countDocuments();


      res.status(200).json({
        success: true,
        data: subscriptions,
        page: page,
        perPage: perPage,
        total: totalUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }


exports.getSingleSubscription =  async (req, res) => {
    try {
      const subscription = await Subscription.findById({id:req.params.id});
  
      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
      }
  
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }


  exports.updateSubscription =  async (req, res) => {
    try {
      const id = req.params.id
      const subscription = await Subscription.findById({id  });
  
      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
      }
  
      subscription.name = req.body.name || subscription.name;
      subscription.price = req.body.price || subscription.price;
  
      await subscription.save();
  
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  exports.deleteSubscription = async(req,res)=>{
    try {
      // Check if the subscription exists
      const subscription = await Subscription.findByIdAndRemove(req.params.id);

      if (!subscription) {
        return res.status(400).json({ error: 'Subscription does not exist' });
      }
  
      // Check if the subscription is active
      if (!subscription.isActive) {
        return res.status(400).json({ error: 'Subscription is not active' });
      }
  
      // Send a response to the client
      res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
      // Send an error response to the client
      res.status(500).json({ error: error.message });
    }
  }



  exports.updateStatus = async (req, res) => {
    const { status, _id } = req.body
  
    console.log('req body of updateStatus', req.body)
  
    try {
      if (status === "activate") {
        console.log('error 2')
        const user = await Subscription.findByIdAndUpdate(_id, { isActive: true })
        return res.status(200).json({ success: true, msg: "Account Activated", user: user })
      }
      else {
        console.log('error 1')
        const user = await Subscription.findByIdAndUpdate(_id, { isActive: false })
        console.log('user data =>', user)
        return res.status(200).json({ success: true, msg: "Account Deactive", user: user })
      }
    } catch (error) {
      return res.status(500).json({ success: false, msg: "Internal Server Error", error })
    }
  }