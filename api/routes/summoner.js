const express = require('express')
const router = express.Router()
const { RateLimiter } = require('limiter')

const {LolApi, Constants} = require('twisted')
const api = new LolApi({key: process.env.TWISTED_API_KEY})

// Made limits lower just so I wont get a 429
const limiter1 = new RateLimiter({tokensPerInterval: 15, interval: 'second'})
const limiter2 = new RateLimiter({tokensPerInterval: 75, interval: 120000})

const apiLimiter = async () => {
    await limiter1.removeTokens(1)
    await limiter2.removeTokens(1)
}

const getMatch = async (gameId, region) => {
    await apiLimiter()
    
    const match = await api.Match.get(gameId, region)
    return match
}


router.get('/:server/:username' , async (req, res) => {
    try {
        const {server, username} = req.params
        if (server === 'na') {
            const region = Constants.Regions.AMERICA_NORTH
            await apiLimiter()
            let summoner = await api.Summoner.getByName(username, region)
            await apiLimiter()
            console.log('accountId: ' + summoner.response.accountId)
            let {response: {matches}} = await api.Match.list(summoner.response.accountId, region)

            for (let i = 0; i < matches.length; i++) {
                let {gameId} = matches[i]
                console.log(gameId)
                let {rows} = await req.pool.query({text: 'SELECT * FROM matches WHERE gameId = $1', values: [gameId]})
                if (rows.length === 0) {
                    const match = await getMatch(gameId, region)
                    let players = []
                    match.response.participantIdentities.forEach((elem) => {
                        // console.log(elem)
                        players.push(elem.player.accountId)
                    })
                    await req.pool.query({text: 'INSERT INTO matches (gameId, length, players) VALUES ($1, $2, $3)', values: [gameId, match.response.gameDuration, players]})
                    console.log('match: ' + i)  
                } else {
                    console.log('match found')
                }
            }
            console.log('Done with looping through matches')
            const fullMatchList = await req.pool.query({
                text: 'SELECT * FROM matches WHERE $1 = ANY (players);', 
                values: [summoner.response.accountId]
            }).then(data => data.rows);
            return res.json({matchList: fullMatchList})
        } else {
            return res.send('na server only')
        }

    } catch (error) {
        console.log('Error: ' + error.message)
        res.send(`Error: ${error.message}`)
    }
})

module.exports = router