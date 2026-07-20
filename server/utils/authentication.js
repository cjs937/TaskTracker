const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function GenerateToken(userID, userName, userRole, hoursTilExpire = 1) {
    const payload = {
        id: userID,
        name: userName,
        role: userRole
    }

    return jwt.sign(payload, JWT_SECRET, {expiresIn: `${hoursTilExpire}h`});
}

const authenticateJWT = (req, res, next) => {
try{
    console.log("Begin jwt authentication");
    const header = req.headers.authorization;
    if(!header) {
        return res.status(400).json({message: "Auth header is missing."});
    }
    console.log("Auth header:", header);


    const token = header.split(" ")[1];
    if(!token) {
        return res.status(400).json({message: "Auth token is missing."});
    }
    console.log("Attempting to authenticate token:", token);

    req.user = jwt.verify(token, JWT_SECRET);

    next();
}
catch (error) {
    console.error("Error authenticating token:", error);
    return res.status(401).json({error: "Invalid or expired token."});
}
};

module.exports = {
    GenerateToken,
    authenticateJWT
};