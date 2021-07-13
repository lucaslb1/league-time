const pgp = require('pg-promise')()

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}
const db = pgp(cn)
let q = 
'CREATE TABLE IF NOT EXISTS matches (' +
'    gameId BIGINT, ' +
'    length BIGINT, ' +
'    players TEXT[], ' +
'    PRIMARY KEY(gameId)' +
');';

db.none(q).then((res) => {
    console.log('succesfully ran db setup')
}).catch((error) => {
    console.log('Error: ' + error.message)
})

module.exports = db;