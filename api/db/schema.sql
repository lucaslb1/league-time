
-- Main matches table
CREATE TABLE IF NOT EXISTS matches (
    gameId BIGINT, 
    length BIGINT, 
    players TEXT[], 
    PRIMARY KEY(gameId)
};
