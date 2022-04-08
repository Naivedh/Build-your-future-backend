const bcrypt = require("bcrypt");

const generateHash = async (password) => await bcrypt.hash(password, Number(process.env.SALT_ROUNDS))    

module.exports = generateHash;