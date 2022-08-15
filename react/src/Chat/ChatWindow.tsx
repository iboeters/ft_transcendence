import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Container, Divider, FormControl, Grid, IconButton, List, ListItem, Paper, SpeedDial, SpeedDialAction, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get_backend_host } from '../utils';
import AddUserWindow from './AddUserWindow';
import { Channel } from './Chat.types';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

const ENTER_KEY_CODE = 13;


interface ChatWindowProps { 
    channelsWebSocket: any;
    channel: Channel;
    openSettings: any;
    setError: any;
    navigation: any;
}

interface ChatWindowState { 
    messages: any[];
    text: string;
    addUserOpen: boolean;
    gameInviteOpen: boolean;
    muted: boolean;
    blockedUsers: number[];
}

class ChatWindow extends React.Component<ChatWindowProps, ChatWindowState> {

    constructor(props: ChatWindowProps){
        super(props);
        this.state = { 
            messages: [], 
            text: "",
            addUserOpen: false,
            gameInviteOpen: false,
            muted: false,
            blockedUsers: [],
        }
    }

    // async redirHome(payload: any) {
    //     console.log("RedirHome");
    //     const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
	// 		method: 'GET',
	// 		credentials: 'include',
	// 	}).then(response => response.json());
    //     console.log(await li);
    //     const { navigation } = this.props;
    //     if (await li === false)
    //         navigation("/", { replace: true });
    // }

    async getMessages(){
        return await fetch(get_backend_host() + `/channels/${this.props.channel.name}/messages`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ messages: response }); 
        })
    }

    async checkIfMuted() {
		return await fetch(get_backend_host() + `/channels/${this.props.channel.name}/is-muted`, { 
            method: 'GET',
            credentials: 'include',
        })
        .then((response) => response.json())
        .then((response) => this.setState({muted: response}))
	}

    async getBlockedUsers(){
        return await fetch(get_backend_host() + `/users/user`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ blockedUsers: response.blockedUsers });
        })
    }

    onReceiveMessage(socketMessage: any){   //subscribed to recMessage events through ws
        if (socketMessage.channel === this.props.channel.name) {
            console.log("Received a message for this channel")
            this.setState( { messages: [...this.state.messages, socketMessage.message] } );
        }           
    }

    onUserMuted(payload: any, muted: boolean) {
        if (this.props.channel === payload.channel) {
            console.log("User muted", muted, payload)
            this.checkIfMuted() // todo find out who current user is in this component to compare
        }
    }

    async inviteClassicPong(){
        // const Stack = createNativeStackNavigator();
        this.props.channelsWebSocket.emit("sendMessage", { 
            "channel": this.props.channel.name,
            "message": {
                "text": "Join me for a game of <a href='inviteWaitingRoomClassic'>Classic Pong!</a>", //<a> is HTML link element (anchor)
                "invite": true
            }
        })
        const { navigation } = this.props;
        navigation("/inviteWaitingroomClassic", { replace: true });
    }
    
    async invitePinkPong(){
        this.props.channelsWebSocket.emit("sendMessage", { 
            "channel": this.props.channel.name,
            "message": {
                "text": "Join me for a game of <a href='inviteWaitingRoomPinkPong'>PinkPong!</a>",
                "invite": true
            }
        })
        const { navigation } = this.props;
        navigation("/inviteWaitingroomPinkPong", { replace: true });
    }
    
    subscribeWebsocketEvents() {
        this.props.channelsWebSocket.on("recMessage", (payload: any) => {this.onReceiveMessage(payload)} )
        this.props.channelsWebSocket.on("userMuted", (payload: any) => {this.onUserMuted(payload, true)} )
        this.props.channelsWebSocket.on("userUnmuted", (payload: any) => {this.onUserMuted(payload, false)} )
    }

    componentDidMount() {
        console.log("Mounting", this.props.channel);
        this.getBlockedUsers().then(() =>
        this.getMessages()
        )
        this.subscribeWebsocketEvents()
        this.checkIfMuted()
    }
    
    componentDidUpdate(prevProps: ChatWindowProps, prevState: ChatWindowState) { 
        if (
            !prevProps.channel || !this.props.channel ||
            prevProps.channel.name !== this.props.channel.name) {
            this.getMessages()
        }
    }

    async postMessage() {
        this.props.channelsWebSocket.emit("sendMessage", { 
            "channel": this.props.channel.name,
            "message": {
                "text": this.state.text
            }
        }) //There is no need to run JSON.stringify() on objects as it will be done for you by Socket.io
        this.setState({text: ""})
	}
    
    formatMessageTime(message: any) {
        const date = new Date(message.date)
        return `${date.toLocaleString()}`
    }
    
    handleEnterKey(event: any) {
        if(event.keyCode === ENTER_KEY_CODE){
            this.postMessage();
        }
    }
    
    handleClose = () => {
        this.setState( {addUserOpen: false} );
    };
    
    render() {
        // console.log(this.state.blockedUsers)
        const filteredMessages = this.state.messages.filter((msg) => 
        !this.state.blockedUsers.includes(Number(msg.sender.id))
        )
        // console.log(filteredMessages)
        
        const listChatMessages = filteredMessages.map((msg, index) => {
            return (
                <ListItem key={index}>
                    <div>
                        <Typography variant="caption">
                            {`${this.formatMessageTime(msg)}`}
                        </Typography>
                        <Typography variant="body1">
                            <Link to={{ pathname:`/userinfo/${msg.sender.id}`} } style={{ color: '#e91e63' }}>
                                {`${msg.sender.username}`}
                            </Link>
                        </Typography>
                        {msg.invite &&
                            <Typography variant="h6"
                            dangerouslySetInnerHTML={{
                                __html: `${msg.text} ` // make links work https://stackoverflow.com/questions/66028355/material-ui-styles-and-html-markdown 
                            }}>
                            </Typography>
                        }
                        {!msg.invite &&
                            <Typography variant="h6">
                                {msg.text}
                            </Typography> 
                        }
                    </div>
                </ListItem> 
            )}
            );
            
            const actions = [
                { icon: <SportsEsportsIcon />, name: 'Classic' },
                { icon: <SportsEsportsIcon />, name: 'Special' },
            ];
            
            return (
                <Fragment>
                <Container>
                    <Paper elevation={5} sx={{ bgcolor: '#f48fb1'}}>
                        <Box p={3} sx={{ m:5 }}>
                            <Grid container direction="row" alignItems="center">
                                <Grid xs={10} item>
                                    <Typography variant="h4" gutterBottom>
                                        {this.props.channel.displayName ? this.props.channel.displayName : this.props.channel.name}
                                    </Typography>
                                </Grid>
                                <Grid xs={1} item>
                                    { this.props.channel.channelType !== "direct message" &&
                                        <IconButton onClick={() => { this.props.openSettings(true) }}
                                        color="secondary">
                                                <SettingsIcon style={{ color: '#ec407a' }}/>
                                        </IconButton>
                                    }
                                </Grid>
                                <Grid sx={{position: 'relative'}} xs={1} item>
                                    { this.props.channel.channelType !== "direct message" &&
                                        <IconButton onClick={() => { this.setState( {addUserOpen: true} ) }}
                                        color="secondary">
                                                <PersonAddIcon style={{ color: '#ec407a' }}/>
                                        </IconButton>
                                    }
                                    { this.props.channel.channelType === "direct message" && // challenge another player to a game
                                        <SpeedDial
                                        direction={'down'}
                                        ariaLabel="SpeedDial tooltip example"
                                        sx={{position: 'absolute', top: -40, }}
                                        icon={<SportsEsportsIcon />}
                                        onClose={() => { this.setState( {gameInviteOpen: false} ) }}
                                        onOpen={() => { this.setState( {gameInviteOpen: true} ) }}
                                        open={this.state.gameInviteOpen}
                                        >
                                        <SpeedDialAction
                                            // FabProps={{ sx: { bgcolor: '#fcc6ff','&:hover': { bgcolor: '#fcc6ff', }} }}
                                            key={'Classic'}
                                            icon={<VideogameAssetIcon style={{ color: '#f06292' }}/>}
                                            tooltipTitle={'Classic'}
                                            tooltipOpen
                                            onClick={() => this.inviteClassicPong()}
                                            />
                                        <SpeedDialAction
                                            key={'Special'}
                                            icon={<SportsEsportsIcon style={{ color: '#f06292' }}/>}
                                            tooltipTitle={'Special'}
                                            tooltipOpen
                                            onClick={() => this.invitePinkPong()}
                                            />
                                        </SpeedDial> 
                                    }
                                </Grid>
                            </Grid>
                            <AddUserWindow  open={this.state.addUserOpen} handleClose={this.handleClose} 
                                            activeChannel={this.props.channel.name} setError={this.props.setError} />
                            <Divider />
                            <Grid container spacing={4} alignItems="center">
                                <Grid id="chat-window" xs={12} item>
                                    <List id="chat-window-messages">
                                        {listChatMessages}
                                        <ListItem></ListItem>
                                    </List>
                                </Grid>
                                <Grid xs={9} item>
                                    <FormControl fullWidth>
                                        <TextField onChange={(e) => this.setState({text: e.target.value})}
                                            onKeyDown={(e) => this.handleEnterKey(e)}
                                            disabled={this.state.muted}
                                            inputProps={{ maxLength: 140 }}
                                            value={this.state.text}
                                            label="Type your message..."
                                            variant="outlined"/>
                                    </FormControl>
                                </Grid>
                                <Grid xs={1} item>
                                    <IconButton type="submit" onClick={() => this.postMessage()}
                                        disabled={this.state.muted}
                                        color="secondary">
                                            <SendIcon style={{ color: '#ec407a' }}/>
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Container>
            </Fragment>
        );
    }
}

export default function ChatWindowFunction(props: any) {
    const navigation = useNavigate();
    
    return <ChatWindow {...props} navigation={navigation} />;
}
