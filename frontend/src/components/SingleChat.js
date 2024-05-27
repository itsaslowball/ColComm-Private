import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Toast,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogic";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import "./styles.css";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animation/typing.json";
import { Button, Icon } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

let ENDPOINT;

if (process.env.NODE_ENV === "production") {
  ENDPOINT = "https://colcomm.onrender.com"; // Live endpoint
} else {
  ENDPOINT = "http://localhost:8000"; // Local endpoint
}
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const newUser = JSON.parse(localStorage.getItem("userInfo"));
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
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
    socket.on("typing", () => setIsTyping(true));
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
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);

      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to Load the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "button",
      });
    }
  };

  const sendMessage = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setNewMessage("");
      setSelectedImage(null);
      console.log(newMessage, selectedChat._id, selectedImage);
      const { data } = await axios.post(
        "/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
          imageUrl: selectedImage,
        },
        config
      );
      console.log(data);

      setMessages([...messages, data]);

      socket.emit("new message", data);
    } catch (error) {
      const err = error.response.data.error;
      if (err === "Hateful or Abusive Text") {
        toast({
          title: err,
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } else if (err === "Hateful or Abusive Image") {
        toast({
          title: err,
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } else {
        toast({
          title: "Error Occured",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const Formdata = new FormData();
    Formdata.append("file", file);
    Formdata.append("upload_preset", "chatApp");
    Formdata.append("cloud_name", "dyp1jkmgz");
    setLoading2(true);
    fetch("https://api.cloudinary.com/v1_1/dyp1jkmgz/image/upload", {
      method: "post",
      body: Formdata,
    })
      .then((res) => res.json())
      .then((Formdata) => {
        setSelectedImage(Formdata.url.toString());
        setLoading2(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const reportUserHandler = async () => {
    let otherUserId = null;
    let otherUser = null;

    if (selectedChat && selectedChat.users.length === 2) {
      if (user._id === selectedChat.users[0]._id) {
        otherUserId = selectedChat.users[1]._id;
        otherUser = selectedChat.users[1];
      } else {
        otherUserId = selectedChat.users[1]._id;
        otherUser = selectedChat.users[1];
      }
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(
      `/api/message/report`,
      {
        userId: otherUserId,
      },
      config
    );
  };

  useEffect(() => {
    fetchMessages();
    setSelectedImage(null);
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

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
  });

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
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
                <ProfileModal
                  user={getSenderFull(newUser, selectedChat.users)}
                />
                <button
                  onClick={reportUserHandler}
                  style={{ fontSize: "20px", color: "red" }}
                >
                  Report User
                </button>
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
                {/* {
                    messages.map((message) => {
                      return (
                        {cons}
                      )
                    })
                  } */}
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl isRequired>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#292A2A"
                color={"white"}
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
                style={{ paddingRight: "3rem" }} // Add extra space for the button
              />
              {/* Image upload button */}
              <label
                htmlFor="imageUpload"
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <Icon as={AddIcon} boxSize={6} style={{ cursor: "pointer" }} />
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {/* Display selected image */}
              {selectedImage && (
                <div>
                  <img
                    src={selectedImage}
                    alt="Selected Image"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      marginTop: "1rem",
                    }}
                  />
                </div>
              )}
            </FormControl>
            {loading2 ? (
              <Spinner
                size="l"
                w={"10"}
                h={"10"}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <button onClick={sendMessage}>Send</button>
            )}
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
};

export default SingleChat;
