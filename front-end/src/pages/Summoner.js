import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

const Summoner = () => {
    const [response, setResponse] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);

    const { server, username } = useParams();

    useEffect(() => {
        async function getData() {
            try {
                const res = await fetch('http://localhost:3001/api/v1/' + server + '/'+ username);
                const data = await res.json();
                console.log(data);
                setResponse(data.matchList);
                setIsLoaded(true); 
            } catch (error) {
                console.log(error.message)
                setIsError(true);
            }
        };
        
        if (server && username) {
            getData();
        }
    }, [server, username]);

    if (isError) {
        return <h1>Error</h1>;
    }
    if (isLoaded) {
        return (
            <>
                <h1>found {response.length} matches</h1>
            </>
        );
    }
    return <h1>Loading</h1>
}

export default Summoner;