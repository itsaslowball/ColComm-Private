import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, Toast, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getSender, getSenderFull } from '../config/ChatLogic';
import { ChatState } from '../Context/ChatProvider'
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import './styles.css'
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from "../animation/typing.json"


const ENDPOINT = "http://localhost:8000";
var socket, selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const newUser = JSON.parse(localStorage.getItem("userInfo"));
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoPlay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const toast = useToast();

    useEffect(() => {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on('typing', () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));

    }, []);


  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true)
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      console.log(data);
      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to Load the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "button"
      });
    }
  }

  
  const sendMessage = async (event) => {
   
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post('/api/message', {
          content: newMessage,
          chatId: selectedChat._id,
        }, config);

        socket.emit('new message', data);
        setMessages([...messages, data]);
        
      } catch (error) {
        toast({
          title: "Error Occured",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        
      }
    }
  }

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    
    //Typing indicator logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    };
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength)
  }


  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat])



  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  })
  

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            ontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work sans"
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              colorScheme="#343651"
              _hover={{
                background: "#38B2AC",
                color: "black",
              }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(newUser, selectedChat.users)}
                <ProfileModal user={getSenderFull(newUser, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir="column"
            justifyContent={"flex-end"}
            p={3}
            bg="#343637"
            w="100%"
            h="90%"
            borderRadius="lg"
            overFlowY="hidden"
          >
            {/* messeges here */}
            {loading ? (
              <Spinner
                size="xl"
                w={"20"}
                h={"20"}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired>
              {isTyping ? <div>
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              </div> : <></>}
              <Input
                variant="filled"
                bg="#292A2A"
                color={"white"}
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems="center"
          justifyContent={"center"}
          height="100%"
        >
          <Text fontSize={"3xl"} pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat