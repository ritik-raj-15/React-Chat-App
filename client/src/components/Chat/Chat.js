import React,{useEffect,useState} from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'
import './Chat.css';

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages'
import Online from '../Online/Online';
let socket;
const Chat = ({location}) => {
    const [name, setName]=useState('');
    const [room, setRoom]=useState('');
    const [users,setUsers]=useState('');
    const [message, setMessage]=useState('');
    const [messages, setMessages]=useState([]);
    const ENDPOINT = 'https://react-chat-app-server-1.herokuapp.com/'
    useEffect(()=>{
        //const data = queryString.parse(location.search);
       // console.log(location.search);
        //console.log(data);
        const {name, room} = queryString.parse(location.search);

        socket =  io(ENDPOINT);
        setName(name);
        setRoom(room);
       // console.log(socket)
       socket.emit('join',{name,room},(error)=>{
           if(error){
               alert(error);
           }
       });

       return ()=>{//unmounting
           socket.emit('disconnect');
           socket.off();
       }
    },[ENDPOINT,location.search]);

    useEffect(()=>{
        socket.on('message',(message)=>{
                setMessages([...messages,message]);
        });
        socket.on('roomData',({users})=>{
            setUsers(users);
        });
    },[messages]);

    const sendMessage = (event)=>{
        event.preventDefault();
        if(message)
        {
            socket.emit('sendMessage',message,()=> setMessage(''));
        }
    }
    console.log(message,messages);

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room}/>
                <Messages messages={messages} name={name}/>
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
            </div>
            <Online users={users}/>
        </div>
    )
}

export default Chat;
