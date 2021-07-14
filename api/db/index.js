const pgp = require('pg-promise')()
const {join: joinPath} = require('path')

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}
const db = pgp(cn)

function sql(file) {
    const fullPath = joinPath(__dirname, file);
    return new pgp.QueryFile(fullPath, {minify: true});
}

const setupFile = sql('./schema.sql')

db.none(setupFile)
.then((result) => {
    console.log('Success reading schema.sql')
}).catch((error) => {
    console.log(error.message)
})


module.exports = db;