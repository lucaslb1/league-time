import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

const Summoner = () => {
    const [response, setResponse] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);

    const { server, username } = useParams();

    useEffect(() => {
        async function getData() {
            return [{gameId: 123123123, lenght:4932}];
        };
        
        let response = getData();
        setResponse(response);
        setIsLoaded(true); 
    }, []);

    if (isError) {
        return <h1>Error</h1>;
    }
    if (isLoaded) {
        return <h1>done loading</h1>;
    }
    return <h1>Loading</h1>
}

export default Summoner;