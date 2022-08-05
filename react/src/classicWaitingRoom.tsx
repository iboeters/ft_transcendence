import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useEffect, useRef } from 'react';
import { get_backend_host } from './utils';
import {CircularProgress, Typography} from '@mui/material';

// const pinkTheme = createTheme({ palette: { primary: pink } })

const ClassicWaitingRoom = () => {
    const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
    let navigate = useNavigate();

    useEffect(() => {
    console.log('Opening WebSocket');
    webSocket.current = io(get_backend_host(), {
        withCredentials: true
    });

    webSocket.current.emit("loggedInClassic", {
        "loggedIn": true
    });

    function startGame(payload: any) {
        webSocket.current.emit("startGame", {
            "Player1": payload.Player1,
            "Player2": payload.Player2,
            "PinkPong": false
        });
        navigate("/pinkpong", { replace: true });
    }

    webSocket.current.on("found2PlayersClassic", startGame ) // subscribe on backend events
    webSocket.current.on("redirectHomeClassic", redirHome ) // subscribe on backend events

    async function redirHome(payload: any) {
        console.log("RedirHome");
        const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
        console.log(await li);
        if (await li === false)
            navigate("/", { replace: true });
    }

    return () => {
        webSocket.current.emit("playerLeftClassic", {});
        console.log('Closing WebSocket');
        webSocket.current.close();
    }
    }, );

    return (
        <main>
            <div className="menu">
                <Typography variant="h3" color="primary">
                    Searching for opponent
                </Typography>
                <CircularProgress/>
            </div>
        </main>
    )
}

export default ClassicWaitingRoom;
