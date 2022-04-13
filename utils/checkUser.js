const checkUser = (currentValue, requiredValue) => {
    if (currentValue !== requiredValue) {
        throw { message: "Operation not allowed" };
    }
} 
module.exports =  { checkUser };