const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const mongoose = require('mongoose')
const fetch = require('node-fetch')
const Bluebird = require('bluebird');
const jwt = require('jsonwebtoken')

const {
    auth
} = require('./middleware/auth')
fetch.Promise = Bluebird;

const {
    User
} = require('./model/User')
const {
    trim
} = require('lodash')
const {
    resolve,
    reject
} = require('bluebird')
const {
    json
} = require('express')
const {
    Admin
} = require('./model/Admin')

mongoose.Promise = global.Promise

mongoose.connect('mongodb://127.0.0.1:27017/test')

const app = express()
const port = process.env.port || 8000

app.use(express.static('../public/'))
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.send(`${req.method} '${req.url}' Server is under development`)
})

app.post('/', (req, res) => {
    res.send(`${req.method} '${req.url}' Server is under development`)
})

app.post('/admin', (req, res) => {
    res.send(req.url)
})

app.get('/user/:id', auth, (req, res) => {
    const id = req.params.id
    User.findById(id).then((resolve) => {
        if (resolve) {
            res.send(resolve)
        } else {
            res.send({
                result: 'Not Found'
            })
        }
    }, (reject) => {
        res.status(401).send({
            error: 'ID is Invalid'
        })
    }).catch((e) => console.log(e))



})

app.post('/user/create', (req, res) => {
    var userName = (req.body.name) ? req.body.name : 'Unknown'
    var userPassword = (req.body.password) ? req.body.password : 'Unknown'
    var userEmail = (req.body.email) ? req.body.email : 'Unknown'

    const user = {
        "name": userName,
        "password": userPassword,
        "email": userEmail
    }

    const hashedData = new User(User.CreateUserToken(user)).save().then((resolve) => {
        res.send(resolve.tokens.token)

    }, (reject) => {
        res.send(reject)
    }).catch((e) => res.send(e))
})

app.post('/user/:id/edit', auth, (req, res) => {

    /**
* demo input for this kind of request
*{
 
     {
         "name": "",
         "password": "",
         "email": ""
     }

*/
    var id = req.params.id
    var fields = req.body

    User.findOne({
        _id: id
    }).then((user) => {
        var userName = (fields.name) ? fields.name : user.name;
        var userPassword = (fields.password) ? fields.password : user.password
        var userEmail = (fields.email) ? fields.email : user.email
        var data = [userName, userPassword, userEmail]

        User.findOneAndUpdate({
            _id: user._id
        }, {
            name: userName,
            password: userPassword,
            email: userEmail,
            'tokens.token': jwt.sign(userEmail, 'ethiopia')
        }).catch((e) => res.send(e, 401))
    })
    res.send("Successfully Updated", 200)
})

app.post('/user/delete/:id', (req, res) => {
    const id = req.params.id
    User.findByIdAndDelete(id).then((resolve) => {
        res.send(resolve)
    }, (reject) => {
        res.send(reject)
    })
})

app.post('/login', (req, res) => {
    var email = req.body.email
    var password = req.body.password
    var hashedEmail = jwt.sign(email, 'ethiopia')

    User.findOne({
        email
    }).then((user) => {

        if (user.tokens.token.toString() === hashedEmail.toString() && user.password === password) {
            res.set({
                'X-Auth': user.tokens.token
            }).send('User Logged in', 200)

        } else {
            res.set({
                'x-auth': null
            }).send('User Not Logged in', 401)
        }
    }, (reject) => {
        res.set({
                'x-auth': null
            })
            .send('User Not Logged in', 401)
    }).catch((e) => res.set({
        'x-auth': null
    }).send('User Not Logged in', 401))


})

app.post('/:id/logout', auth, (req, res) => {

    res.set({
        'X-Auth': null
    }).send('Logged out', 200)
})

app.get('/user/:id/get_countries/', auth, (req, res) => {

    fetch('https://apiv2.apifootball.com/?action=get_countries&APIkey=8aad05d98d87319d4b7808286e7ab228c58979d2bbe850925028a0ad5784b05d')
        .then((result) =>
            result.json()
        )
        .then((json) => {

            res.send(json)
        })
        .catch((e) => {

            res.status(401).send(({
                'error': true
            }))
        })

})

app.get('/user/:id/get_league', auth, (req, res) => {
    const get_country = req.param('get_country')

    fetch(`https://apiv2.apifootball.com/?action=get_leagues&country_id=${get_country}&APIkey=8aad05d98d87319d4b7808286e7ab228c58979d2bbe850925028a0ad5784b05d`)
        .then(result => result.json())
        .then(json => res.send(json)).catch((e) => res.send(e))


})

app.get('/user/:id/get_team', auth, async (req, res) => {
    const get_league_id = req.param('get_league')

    await fetch(`http://apiv2.apifootball.com/?action=get_teams&league_id=${get_league_id}&APIkey=8aad05d98d87319d4b7808286e7ab228c58979d2bbe850925028a0ad5784b05d`)
        .then(result => result.json())
        .then(json => res.send(json)).catch((e) => res.send({
            'error': true,
            "route": req.url
        }))

})

app.get('/user/:id/get_lineup', auth, (req, res) => {

    const game_id = req.param('game_id')

    fetch(`https://apiv2.apifootball.com/?action=get_lineups&match_id=${game_id}&APIkey=8aad05d98d87319d4b7808286e7ab228c58979d2bbe850925028a0ad5784b05d`)
        .then(result => result.json())
        .then(json => res.send(json)).catch((e) => res.send({
            'error': true,
            "route": req.url
        }))
})

app.get('/user/:id/statistics', auth, (req, res) => {
    const game_id = req.param('game_id')
    fetch(`https://apiv2.apifootball.com/?action=get_statistics&match_id=${game_id}&APIkey=8aad05d98d87319d4b7808286e7ab228c58979d2bbe850925028a0ad5784b05d`)
        .then(result => result.json())
        .then(json => res.send(json))
        .catch((e) => res.send({
            'error': true,
            'route': req.url
        }))

})

app.get('/user/:id/odds', auth, (req, res) => {
    const from = req.param('from')
    const to = req.param('to')

    fetch(`https://apiv2.apifootball.com/?action=get_odds&from=${from}&to=${to}&APIkey=8aad05d98d87319d4b7808286e7ab228c58979d2bbe850925028a0ad5784b05d`)
        .then(result => result.json())
        .then(json => res.send(json))
        .catch((e) => res.send({
            'error': true,
            'route': req.url
        }))
})

app.get('/user/:id/doc', auth, (req, res) => {

    fetch(`https://apifootball.com/documentation/`)
        .then(result => result.json())
        .then(json => res.send(json))
        .catch((e) => res.send({
            'error': true,
            'route': req.url
        }))
})



app.listen(port, () => {
    console.log(`Server Started at port ${port}`)
})