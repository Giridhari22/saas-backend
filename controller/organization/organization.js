const Organization = require('../../saas-backend/logger/model/organizationn
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
exports.createOrganization = async (req, res) => {
  try {
    const { name, email, password, subscriptionId } = req.body;
    // Check if the organization already exists
    const organization = await Organization.findOne({ email });
    const salt = await bcrypt.genSalt(10);

    if (organization) {
      return res.status(400).json({ error: 'Organization already exists' });
    }
    // Create a new organization
    const newOrganization = new Organization({
      name,
      email,
      password: await bcrypt.hash(password, salt),
      subscriptionId,
    });

    if (newOrganization) {
      //         Save to database
      // Save the organization to the database
      await newOrganization.save();
      // Send a response to the client
      res.status(201).json({ error: 'Organization created successfully', createdOrganization: newOrganization });
    } else {
      res.status(201).json({ error: 'Organization cannot created successfully' });
    }

  } catch (error) {
    res.status(201).json({ error: error.message })
  }
};
// sorting data
exports.sortOrganization = async (req, res) => {
  const { sortBy } = req.params;
  console.log("sortBy", sortBy)
  try {
    let sortField = 'name';
    if (sortBy === 'email') {
      sortField = 'email';
    }
    const sortedData = await Organization.find().sort({ [sortField]: 1 });
    res.json(sortedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Login an organization
exports.loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the organization exists
    const organization = await Organization.findOne({ email, isActive: true });
    if (!organization) {
      return res.status(201).json({ error: 'Organization does not exist' });
    }
    // Check if the organization is active
    if (!organization.isActive) {
      return res.status(201).json({ error: 'Organization is not active' });
    }

    // Check if the password is correct
    if (organization) {
      const isPassword = await bcrypt.compare(password, organization.password)
      if (!isPassword) {
        return res.status(201).json({ error: "user not found" });
      }
      else {
        let token = jwt.sign({ user: organization, isOrganization: true }, "mynameisgiri");
        console.log(token);
        return res.status(200).json({ success: true, token: token, message: "user signin successfully", OrganizationUser: organization })
      }
    }

    // Send a response to the client
    res.status(200).json({ message: 'Organization logged in successfully' });
  } catch (error) {
    // Send an error response to the client
    res.status(500).json({ error: error.message });
  }
};
exports.getOrganization = async (req, res) => {
  try {
    const id = req.params.id
    const organization = await Organization.findOne({
      $and: [
        { id }, { isActive: true }
      ]

    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.status(200).json(organization);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// active and deactive status
exports.updateStatus = async (req, res) => {
  const { status, _id } = req.body

  console.log('req body of updateStatus', req.body)

  try {
    if (status === "activate") {
      const user = await Organization.findByIdAndUpdate(_id, { isActive: true })
      return res.status(200).json({ success: true, msg: "Account Activated", user: user })
    }
    else {
      const user = await Organization.findByIdAndUpdate(_id, { isActive: false })
      return res.status(200).json({ success: true, msg: "Account Deactive", user: user })
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Internal Server Error", error })
  }
};
// jklklh
exports.getAllOrganization = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.rowsPerPage) || 5;
  const filter = req.query.searchInput

  const orderBy = req.query.orderBy || "createdAt"
  const order = req.query.order || "desc"

  const orderWith = order == "desc" ? -1 : 1

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




    const organization = await Organization.aggregate([
      {
        "$match": query
      },
      {
        "$lookup": {
          from: "subscriptions",
          localField: 'subscriptionId',
          foreignField: "_id",
          as: "subscriptionData"
        }
      },
      {
        $unwind: "$subscriptionData"
      }, {
        $skip: (page) * perPage
      }, {
        $limit: perPage
      },{
        $project:{
          name:{ $toLower: "$name"},
          email:"$email",
          isActive:"$isActive",
          createdAt:"$createdAt",
          subscriptionName:"$subscriptionData.name"
        }
      },
      {
        $sort:{
          [orderBy]:orderWith
        }
      }
    ])

    const totalUsers = await Organization.find(query).countDocuments();

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    } else {
      return res.status(200).json({
        organization: organization,
        page: page,
        perPage: perPage,
        total: totalUsers
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// Update an organization
exports.updateOrganization = async (req, res) => {
  try {
    const { name, email, password, subscriptionId } = req.body;

    // Check if the organization exists
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(400).json({ error: 'Organization does not exist' });
    }

    // Check if the organization is active
    if (!organization.isActive) {
      return res.status(400).json({ error: 'Organization is not active' });
    }

    // Update the organization
    organization.name = name;
    organization.email = email;
    organization.password = password;
    organization.subscriptionId = subscriptionId;

    // Save the organization to the database
    await organization.save();

    // Send a response to the client
    res.status(200).json({ message: 'Organization updated successfully' });
  } catch (error) {
    // Send an error response to the client
    res.status(500).json({ error: error.message });
  }
};
// Delete an organization
exports.deleteOrganization = async (req, res) => {
  try {
    // Check if the organization exists
    const organization = await Organization.findByIdAndRemove(req.params.id);
    if (!organization) {
      return res.status(400).json({ error: 'Organization does not exist' });
    }

    // Check if the organization is active
    if (!organization.isActive) {
      return res.status(400).json({ error: 'Organization is not active' });
    }



    // Send a response to the client
    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    // Send an error response to the client
    res.status(500).json({ error: error.message });
  }
};
