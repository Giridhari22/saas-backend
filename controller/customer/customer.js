const Customer = require('../../model/customer');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
const { countDocuments } = require('../../model/organization');


// Create a new customer
exports.createCustomer = async (req, res) => {
  try {

    const { name, email, password, organizationId, subscriptionId } = req.body;
    console.log(subscriptionId, 'asdasfwegtrj');

    // Validate the request body
    if (!name || !email || !password || !organizationId) {
      return res.status(201).json({ error: 'Missing required fields' });
    }

    let maxCustomer;
    subscriptionId == "651cf95e5fe14cf71a4e2c87" ? maxCustomer = 5 : subscriptionId == "651cf9705fe14cf71a4e2c8d" ? maxCustomer = 10
      : subscriptionId == "651cf97b5fe14cf71a4e2c93" ? maxCustomer = 15 : maxCustomer = "No Limit"

    // Check if the customer already exists
    const existingCustomer = await Customer.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    if (existingCustomer) {
      return res.status(201).json({ error: 'Customer already exists' });
    }

    // Create a new customer

    const countOfCustomer = await Customer.countDocuments({ organizationId: organizationId })

    console.log('asdasdasdasfagtreg', maxCustomer, countOfCustomer)
    if (maxCustomer=="No Limit" || countOfCustomer < maxCustomer) {
      const customer = new Customer({
        name,
        email,
        password: await bcrypt.hash(password, salt),
        organizationId,
        isActive: true,
      });
      await customer.save();
      res.status(201).json({ customer });
    }
    else {
      res.status(201).json({ error: "Max Customers limit reached for your subscription." })
    }
    // Save the customer to the database
    // Send a 201 Created response
  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
};

// Login a customer
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate the request body
    if (!email || !password) {
      return res.status(201).json({ error: 'Missing required fields' });
    }

    // Check if the customer exists
    const customer = await Customer.findOne({ email: email, isActive: true }).populate("organizationId");
    if (!customer) {
      return res.status(201).json({ error: 'Customer not found' });
    }

    // Check if the password is correct
    if (customer) {

      const isPassword = await bcrypt.compare(password, customer.password)
      if (!isPassword) {
        return res.status(201).json({ error: "user not found" });
      }
      else {
        let token = jwt.sign({ user: customer, isCustomer: true }, "mynameisgiri");
        console.log(token);
        return res.status(200).json({ success: true, token: token, message: "customer signin successfully", customer: customer })
      }
    }

    // Check if the customer is active
    if (!customer.isActive) {
      return res.status(201).json({ error: 'Customer is not active' });
    }

  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
};



//Get all customers
exports.getCustomers = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.rowsPerPage) || 5;
  const orderBy = req.query.orderBy || "createdAt";
  const order = req.query.order || "desc"
  console.log("orderby=>", orderBy, "order=>", order)
  const orderWith = order == "desc" ? -1 : 1
  const filter = req.query.searchInput

  try {

    let query = {}
    if (filter != "" && filter != null && filter != undefined) {
      query = {

        $or: [
          {
            email: { $regex: `${filter}`, $options: 'i' },
          },
          { name: { $regex: `${filter}`, $options: 'i' } }
        ]
      }
    }



    const customers = await Customer.aggregate([
      {
        "$match": query,
      },
      {  // just like populate , but it takes four field :collection name , localfield name that means by which u taking refrence , 
        // foreignField : means ki origional table m wo refrence field ka name kya hai , as: matlb kis name se jana jayega 
        $lookup: {
          from: 'organizations',
          localField: "organizationId",
          foreignField: "_id",
          as: "org"
        }
      },
      {
        $unwind: "$org" //to get single object .. its important
      },
      {
        $skip: (page) * perPage
      },
      {
        $limit: perPage
      },
      { // isme logic laga sakte hai aur dekh sakte hai ki kis kis field pe kam karna hai
        $project: {
          name: { $toLower: "$name" },
          email: "$email",
          organizationName: "$org.name",
          isActive: "$isActive",
          createdAt: '$createdAt',
        }
      },
      {
        $sort: {
          [orderBy]: orderWith
        }
      }
    ])


    const totalUsers = await Customer.find(query).countDocuments();
    // Send a 200 OK response
    res.status(200).json({
      customers: customers,
      page: page,
      perPage: perPage,
      total: totalUsers
    });
  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
};



// Get a single customer
exports.getCustomer = async (req, res) => {
  try {

    const organizationId = req.params.organizationId;
    const page = parseInt(req.query.page) || 0;
    const perPage = parseInt(req.query.rowsPerPage) || 5;
    const orderBy = req.query.orderBy || "createdAt";
    console.log('query getCustomer', req.query.orderBy)
    const order = req.query.order || "desc"
    const orderWith = order == "desc" ? -1 : 1

    // Validate the request parameter           
    if (!organizationId) {
      return res.status(201).json({ error: 'Missing required parameter' });
    }
    // Check if the customer exists

    try {

      const customer = await Customer.find({ organizationId })
        .sort({ [orderBy]: orderWith })
        .skip((page) * perPage)
        .limit(perPage)
      var OrgId = new mongoose.Types.ObjectId(organizationId)

      const totalUsers = await Customer.aggregate([
        {
          $match: {
            organizationId: OrgId
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])

      console.log('total count =>', totalUsers[0].count)
      if (!customer) {
        return res.status(201).json({ error: 'Customer not found' });
      } return res.status(200).json({
        customer: customer,
        page: page,
        perPage: perPage,
        total: totalUsers[0].count,
      });
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    // Send a 500 Internal Server Error response
    return res.status(500).json({ error: error.message });
  }
};




// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, password, organizationId, isActive } = req.body;
    const { id } = req.params;

    // Validate the request body
    if (!name || !email || !password || !organizationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update the customer
    customer.name = name;
    customer.email = email;
    customer.password = password;
    customer.organizationId = organizationId;
    customer.isActive = isActive;

    // Save the customer
    await customer.save();

    // Send a 200 OK response
    res.status(200).json({ customer });
  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the request parameter
    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter' });
    }

    // Check if the customer exists
    const customer = await Customer.findByIdAndRemove(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }



    // Send a 200 OK response
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
}


exports.updateStatus = async (req, res) => {
  const { status, _id } = req.body

  console.log('req body of updateStatus', req.body)

  try {
    if (status === "activate") {
      console.log('error 2')
      const user = await Customer.findByIdAndUpdate(_id, { isActive: true })
      return res.status(200).json({ success: true, msg: "Account Activated", user: user })
    }
    else {
      console.log('error 1')
      const user = await Customer.findByIdAndUpdate(_id, { isActive: false })
      console.log('user data =>', user)
      return res.status(200).json({ success: true, msg: "Account Deactive", user: user })
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Internal Server Error", error })
  }
}

exports.searchCustomer = async (req, res) => {
  try {
    const key = req.params.key
    // If key is a string (e.g., "Apple"), search for brand using regex
    data = await Customer.find({
      $or: [
        // {price: {$regex : `${Number(key)}`}}
        { name: { $regex: `${key}`, $options: 'i' } },
        { email: { $regex: `${key}`, $options: 'i' } },
      ]
    })
    res.status(200).json({ data: data })
  } catch (error) {
    console.log(error)
  }
}