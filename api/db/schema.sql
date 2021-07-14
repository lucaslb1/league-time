
-- Main matches table
CREATE TABLE IF NOT EXISTS matches (
    gameid BIGINT, 
    players TEXT[], 
    queueid int,
    gameType TEXT,
    gameDuration BIGINT,
    platformId TEXT,
    gameCreation BIGINT,
    seasonId INT,
    gameVersion TEXT,
    mapId INT,
    gameMode TEXT,
    PRIMARY KEY(gameId)
);
