require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db')
const summoner = require('./routes/summoner')

const app = express()

// const Pool = require('pg').Pool
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
// })

// try {
//     db.db_setup(pool)
// } catch (error) {
//     console.log(error.message)
// }



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


// Routes
app.get('/', (req, res) => {
    return res.send('Test')
})

//app.get('/drop_tables', db.drop_tables)
//app.get('/test', db.get_matches)

// Main API
app.use('/api', summoner)


let port = process.env.PORT
app.listen(port, ()=> {
    console.log('Runnig express api on http://localhost:'+port)
})

