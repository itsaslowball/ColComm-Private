import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";

const CreateBlog = ({ fetchAgain, setFetchAgain }) => {
  const { user, blogs, setBlogs } = ChatState();
  const [title, setTitle] = useState();
  const [content, setContent] = useState();

  const toast = useToast();
  const submitHandler = async () => {
    try {
      const { data } = await axios.post("/api/blogs/compose", {
        title: title,
        postContent: content,
        user: user,
      });
      setTitle("");
      setContent("");
      setFetchAgain(!fetchAgain);
    } catch (error) {
      // console.error(error.response.data);
            setTitle("");
            setContent("");
            setFetchAgain(!fetchAgain);
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

  return (
    <Box
      width={"100%"}
      //   margin={"20px"}
      padding="20px"
    >
      <FormControl isRequired>
        <FormLabel>Title</FormLabel>
        <Textarea
          placeholder="Title of the blog"
          background={"#242526"}
          marginBottom={"20px"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <FormLabel>Content</FormLabel>
        <Textarea
          placeholder="Content of the Blog"
          background={"#242526"}
          marginBottom={"20px"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="10"
        />
        <Button
          background={"blue"}
          color={"white"}
          _hover={{ background: "#953845" }}
          onClick={submitHandler}
        >
          Submit
        </Button>
      </FormControl>
    </Box>
  );
};

export default CreateBlog;
