const argon2 = require('argon2')

async function hashPassword(plainPassword){
    const hash = await argon2.hash(plainPassword)
    return hash
}

async function verifyPassword(hash , plainPassword){
    const verifiedPassword = await argon2.verify(hash , plainPassword)
    return verifiedPassword
}

module.exports = {
    hashPassword ,
    verifyPassword
}