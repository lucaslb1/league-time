require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db')
const summoner = require('./routes/summoner')

const app = express()

// Middlewear functions
const timer =  (req, res, next) =>  {
    console.time('response time')
    next()
    console.timeEnd('response time')
}
const db_middlewear = (req, res, next) => {
    req.pool = db
    next()
}

// Middlewear
app.use(cors())
app.use(timer)
app.use(db_middlewear)

// Main API
app.use('/api', summoner)


app.get('/', (req, res) => {
    return res.send('Test')
})

app.get('/drop_table', async (req, res) => {
    try {
        await req.pool.query('DROP TABLE IF EXISTS matches;')
        res.send('droped matches table')
    } catch (error) {
        res.send('error: ' + error.message)
    }
})

let port = process.env.PORT
app.listen(port, ()=> {
    console.log('Runnig express api on http://localhost:'+port)
})

