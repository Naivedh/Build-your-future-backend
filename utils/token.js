const jwt = require("jsonwebtoken")

// const verfiyToken = (token) => { // resolve logout(client side)
//     try {
//         return jwt.verify(token, process.env.JWT_KEY);
//     } catch (err) {
//         throw err
//     }
// }

const verfiyTokenAndExtractInfo = (token, key = "_id") => {
    try {
        const data = jwt.verify(token, process.env.JWT_KEY);
        return data[key];
    } catch (err) {
        throw err
    }
}

const generateToken = (payload) => jwt.sign(payload, process.env.JWT_KEY);


module.exports = { generateToken, verfiyTokenAndExtractInfo }