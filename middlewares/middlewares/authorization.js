const jwt = require("jsonwebtoken")
const authMiddle = (req, res, next) => {
    const token  = req.headers['authorization'];

    console.log(req.headers)
    console.log(token)

    if (!token) return res.json({ message: "Token is not valid" })
    const decode = jwt.verify(token, "mynameisgiri");
    console.log(decode)
    if (decode) {
        req.user = decode.user;        
        next()
    } else {
        res.json({ mesage: "Authorization Failed!" })
    }
}


module.exports={
    authMiddle
}