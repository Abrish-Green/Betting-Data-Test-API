const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const {
    resolve
} = require('bluebird')

const AdminSchema = mongoose.Schema({

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
    activity_log: {
        type: String,
        trim: true
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


const Admin = mongoose.model('Admin', AdminSchema)

module.exports = {
    Admin
}