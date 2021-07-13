
// Setups up database tables
exports.db_setup = async (pool) => {
    let q = 
        'CREATE TABLE IF NOT EXISTS matches (' +
        '    gameId BIGINT, ' +
        '    length BIGINT, ' +
        '    players TEXT[], ' +
        '    PRIMARY KEY(gameId)' +
        ');'
    
    const res = await pool.query(q)
    console.log('ran db_setup')
}

exports.drop_tables = async (req, res) => {
    try {
        await req.pool.query('DROP TABLE IF EXISTS matches;')
        res.send('droped matches table')
    } catch (error) {
        res.send('error: ' + error.message)
    }
}

exports.get_matches = async (req, res) => {
    try {
        let q = 'SELECT * FROM matches'
        let {rows} = await req.pool.query(q)
        res.send(rows)
    } catch (error) {
        res.send(error.message)
    }
}