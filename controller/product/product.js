const Product = require("../../model/product");
const logger = require("../../logger/logger");
const { default: mongoose } = require("mongoose");
// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Validate the request body
    const { brand, price, quantity, customerId, organizationId } = req.body;
    if (!brand || !price || !quantity || !customerId || !organizationId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new product
    const product = new Product({
      brand,
      price,
      quantity,
      customerId,
      organizationId,
    });

    // Save the product to the database
    await product.save();

    // Send a 201 Created response
    res.status(201).json({ message: "Product created successfully", createdProduct: product });
  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
};
// Update a product
exports.updateProduct = async (req, res) => {
  try {
    // Validate the request body
    const { brand, price, quantity, customerId, organizationId } = req.body;
    if (!brand || !price || !quantity || !customerId || !organizationId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product
    product.brand = brand;
    product.price = price;
    product.quantity = quantity;
    product.customerId = customerId;
    product.organizationId = organizationId;

    // Save the product to the database
    await product.save();

    // Send a 200 OK response
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
};
exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.rowsPerPage) || 5;
  const filter = req.query.searchInput

  const orderBy = req.query.orderBy || "createdAt"
  const order = req.query.order || "desc"

  console.log("orderBy =>", orderBy, "order", order)
  const orderWith = order == "desc" ? -1 : 1

  try {

    let query = { isActive: true }
    console.log('filter of get product', filter)
    if (filter != "" && filter != null && filter != undefined) {
      query = {
        $and: [
          { isActive: true }, // Existing condition
          {
            brand: { $regex: `${filter}`, $options: 'i' } // New condition for filtering by brand
          }
        ]
      }
    }



    const product = await Product.aggregate([
      { "$match": query },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $unwind: "$customerData"
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organizationData",
        },
      },
      {
        $unwind: "$organizationData", //to get single object .. its important
      },
      {
        $skip: (page) * perPage
      }, {
        $limit: perPage
      },
      { // isme logic laga sakte hai aur dekh sakte hai ki kis kis field pe kam karna hai
        $project: {
          brand: "$brand",
          price: { $toDouble: "$price" },
          createdAt: "$createdAt",
          organizationName: "$organizationData.name",
          customerName: { $toLower: "$customerData.name" },
          quantity: "$quantity"
        }
      },
      {
        $sort: {
          [orderBy]: orderWith
        }
      }
    ])
    const totalUsers = await Product.find(query).countDocuments();
    if (!product) {
      return res.status(404).json({ msg: "product not found" })
    } else {
      return res.status(200).json({
        product: product,
        page: page,
        perPage: perPage,
        total: totalUsers
      });
    }
  } catch (error) {
    console.log(error)
  }
}
exports.getProductByOrganization = async (req, res) => {
  const orderBy = req.query.orderBy || "createdAt"
  const order = req.query.order || "desc"

  const orderWith = order == "desc" ? -1 : 1

  const organizationId = req.params.organizationId

  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.rowsPerPage) || 5;

  try {
    const product = await Product.aggregate([
      {
          $match:{organizationId: new mongoose.Types.ObjectId(organizationId)}
      },
      {
        $lookup: {
          from: "customers",
          localField: 'customerId',
          foreignField: "_id",
          as: 'customerData'
        }
      }, {
        $unwind: "$customerData"
      },
      {
        $skip: (page) * perPage
      },
      {
        $limit: perPage
      },
       {
        $project: {
          brand: { $toLower: "$brand" },
          price:{$toDouble: "$price"},
          quantity: "$quantity",
          customerName: "$customerData.name",
          createdAt: "$createdAt"
        }
      },
      {
        $sort: {
          [orderBy]: orderWith
        }
      }
    ])
    const totalUsers = await Product.countDocuments();

    if (!product) {
      return res.status(404).json({ msg: "product not found" })
    } else {
      return res.status(200).json({
        product: product,
        page: page,
        perPage: perPage,
        total: totalUsers,
      });
    }
  }
  catch (err) {
    console.log('error catch =>', err)
  }
}
exports.getProductByCustomerId = async (req, res) => {
  const customerId = req.params.customerId
  
  const orderBy = req.query.orderBy || "createdAt"
  const order = req.query.order || "desc"
  const orderWith = order == "desc" ? -1 : 1
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.rowsPerPage) || 5;
  try {
    if (!customerId) {

      return res.sendStatus(201, "No Id Provided");
    }
    const product = await Product.aggregate([
      {
        $match: {customerId: new mongoose.Types.ObjectId(customerId)}
      },
      {
        $lookup: {
          from: "customers",
          localField: 'customerId',
          foreignField: "_id",
          as: "cus"
        }
      },
      {
        $unwind: "$cus"
      },
      
      {
        $lookup: {
          from: "organizations",
          localField: 'organizationId',
          foreignField: "_id",
          as: "org"
        }
      },
      {
        $unwind: "$org"
      }, 
      {
        $skip: (page) * perPage
      },
      {
        $limit: perPage
      }, {
        $project: {
          brand: "$brand",
          price: {$toDouble : "$price"},
          quantity: "$quantity",
          customerName: "$cus.name",
          organizationName:"$org.name",
          createdAt:"$createdAt"
        }
      }, {
        $sort: {
          [orderBy]: orderWith
        }
      }
    ])

    var cusId = new mongoose.Types.ObjectId(customerId)
 
    const totalUsers = await Product.aggregate([
      {
        $match: {
          customerId: cusId
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ])  

    if (!product) {
      return res.status(404).json({ msg: "product not found" })
    } else {
      return res.status(200).json({
        product: product,
        page: page,
        perPage: perPage,
        total: totalUsers[0]?.count
      });
    }
  } catch (error) {
    console.log(error)
  }
}

exports.deleteProducts = async (req, res) => {
  const product = await Product.findByIdAndRemove({ _id: req.params.id });
  if (!product) {
    res.json(err);
  } else {
    res.json('product deleted Successfully')
  }
};
