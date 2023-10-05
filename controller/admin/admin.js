const Admin = require("../../model/admin");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


exports.createAdmin = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const newAdmin = new Admin({
            name: "shankar jha",
            email: "shankarjha123@gmail.com",
            password: await bcrypt.hash("Shankar@123", salt),
        })
        console.log("newAdmin", newAdmin)
        await newAdmin.save()
        res.status(200).json({ user: newAdmin })

    } catch (error) {
        res.status(500).json({ message: error })
    }
}

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const login_admin = await Admin.findOne({ email: email });
        if (!login_admin) {
            return res.status(201).json({ error: 'admin does not exist' });
        }

        if (login_admin) {
            const isPassword = await bcrypt.compare(password, login_admin.password)
            if (!isPassword) {
                return res.status(201).json({ error: "user not found" });
            } else {
                let token = jwt.sign({ user: login_admin, isAdmin: true }, "mynameisgiri");
                return res.status(200).json({ success: true, token: token, message: "user signin successfully", user: login_admin })
            }
        }
    } catch (error) {
        res.status(201).json({ error: "error has occured" })
    }
}