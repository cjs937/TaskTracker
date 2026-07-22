const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function GenerateToken(userID, userName, userAuthority, hoursTilExpire = 1) {
    const payload = {
        id: userID,
        name: userName,
        authority: userAuthority
    }

    return jwt.sign(payload, JWT_SECRET, {expiresIn: `${hoursTilExpire}h`});
}

function ValidateToken(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    }
    catch(error) {
        return false;
    }
}

const authenticateJWT = (req, res, next) => {
try{
    const header = req.headers.authorization;
    if(!header) {
        return res.status(400).json({message: "Auth header is missing."});
    }

    const token = header.split(" ")[1];
    if(!token) {
        return res.status(400).json({message: "Auth token is missing."});
    }

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
    authenticateJWT,
    ValidateToken
};