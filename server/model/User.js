const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const {
    resolve
} = require('bluebird')

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        maxlength: 20,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 5,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        minlength: 8,
        required: true
    },
    tokens: {
        access: {
            type: String,
        },
        token: {
            type: String
        }
    }
})

UserSchema.statics.CreateUserToken = function (userData) {
    var auth = 'x-auth'
    var email = userData.email
    var salt = 'ethiopia'
    var HashedToken = jwt.sign(email, salt)

    const protectedData = {
        "name": userData.name,
        "password": userData.password,
        "email": userData.email,
        "tokens": {

            "access": auth,
            "token": HashedToken

        }
    }

    return (protectedData)
    //return console.log('Unable to save')


}
UserSchema.methods.compareToken = function (email) {
    var user = this
    var salt = 'ethiopia'
    var hasedEmail = jwt.sign(email, salt)

    return new Promise((resolve, reject) => {
        if (user.tokens.token == hasedEmail) {
            resolve({
                user_found: true
            })
        }

        reject({
            user_found: false
        })
    })

}
const User = mongoose.model('User', UserSchema)

module.exports = {
    User
}