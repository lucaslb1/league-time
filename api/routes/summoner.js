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

const getRegion = (servername) => {
    switch(servername) {
        case 'na':
            return Constants.Regions.AMERICA_NORTH;
        case 'euw':
            return Constants.Regions.AMERICA_NORTH;
        case 'kr':
            return Constants.Regions.AMERICA_NORTH;
        case 'jp':
            return Constants.Regions.JAPAN;
        case 'eun':
            return Constants.Regions.EU_EAST;
        case 'oce':
            return Constants.Regions.OCEANIA;
        case 'br':
            return Constants.Regions.BRAZIL;
        case 'las':
            return Constants.Regions.LAT_SOUTH;
        case 'lan':
            return Constants.Regions.LAT_SOUTH;
        case 'ru':
            return Constants.Regions.RUSSIA;
        case 'tr':
            return Constants.Regions.TURKEY;
        default:
            return Constants.Regions.AMERICA_NORTH;
    }
};


/**
 * 1. Get Summoner accountId
 * 2. Get match list + query database (using promises)
 * 3. Find list of new gameId's not in DB (using sets)
 * 4. Send response to client with, old matches and number of new matches found
 * 5. Open web socket, add new matches to queue, figure out how to do that part
 */
router.get('/v2/:server/:username', async (req, res, next) => {
    const {server, username} = req.params;
    const REGION = getRegion(server);

    api.Summoner.getByName(username, REGION).then(async (summoner) => {
        let accountId = summoner.response.accountId;
        
        let dbMatchListPromise = req.pool.any({
            text: 'SELECT * FROM matches WHERE $1 = ANY (players);',
            values: [accountId]
        });

        let matchListPromise = api.Match.list(accountId, REGION).then(res => res.response.matches); // Todo: rate limit
        let [dbMatchList, apiMatchList] = await Promise.all([dbMatchListPromise, matchListPromise]);

        // Create two sets of gameId's
        let dbSet = new Set();
        let apiSet = new Set();
        dbMatchList.forEach(elem => dbSet.add(parseInt(elem.gameid))); // For some reason the gameId's returned from db where string
        apiMatchList.forEach(elem => apiSet.add(elem.gameId));
        console.log('dbSet size: ' + dbSet.size);
        console.log('apiSet size: ' + apiSet.size);
        // console.log(dbSet);
        // console.log(apiSet);
        
        // Find set of gameId's in apiSet not in dbSet
        let differenceSet = new Set([...apiSet].filter(x => !dbSet.has(x)));
        console.log('differenceSet size: ' + differenceSet.size);
        
        res.status(200).send({
            matchList: dbMatchList,
            numNewMatches: differenceSet.size,
            numOldMatches: dbSet.size,
        });

        // Here is where I should deal with opening web socket and such...
    })
    .catch((error) => {
        if (error.status === 403) {
            console.log('API KEY INVALID');
        }
        next(error);
    });
});


router.get('/v1/:server/:username' , async (req, res) => {
    try {
        const {server, username} = req.params
        if (server === 'na') {
            const REGION = Constants.Regions.AMERICA_NORTH
            await apiLimiter()
            let summoner = await api.Summoner.getByName(username, REGION)
            await apiLimiter()
            console.log('accountId: ' + summoner.response.accountId)
            let {response: {matches}} = await api.Match.list(summoner.response.accountId, REGION)

            for (let i = 0; i < matches.length; i++) {
                let {gameId} = matches[i]
                console.log(gameId)
                let {rows} = await req.pool.query({text: 'SELECT * FROM matches WHERE gameId = $1', values: [gameId]})
                if (rows.length === 0) {
                    const match = await getMatch(gameId, REGION)
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