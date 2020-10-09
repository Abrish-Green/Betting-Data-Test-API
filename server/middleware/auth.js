const {
    User
} = require('../model/User')
const mongoose = require('mongoose')

const auth = function (req, res, next) {

    var id = req.params.id

    User.findById(id).then((user) => {
        if (user) {
            req.user = user
            req.token = user.tokens.token
            res.set({
                'X-Auth': user.tokens.token
            })
            next();
        } else {
            res.send({
                result: 'User Doesn\'t Exist',
                logged: 'out'
            })
        }
    }).catch((e) => res.send({
        result: 'User Doesn\'t Exist'
    }))

}

module.exports = {
    auth
}