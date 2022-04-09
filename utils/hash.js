const bcrypt = require("bcrypt");

const generateHash = async (password) => {
    return await bcrypt.hash(password, Number(process.env.SALT_ROUNDS))
}

const compareHash = async (plainTextPassword, encryptedPassword) => {
    return await bcrypt.compare(plainTextPassword, encryptedPassword);;
}

module.exports = { generateHash, compareHash };