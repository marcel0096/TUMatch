import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
  Modal,
} from "react-bootstrap";
import Message from "./Message";
import Cookies from "js-cookie";
import { FaUserCircle } from "react-icons/fa";

import { useAuth } from "../../AuthContext";
import { useSearchParams } from "react-router-dom";
import LoadingScreen from "../../LoadingScreen.jsx";

import {
  fetchChatsbyUserId,
  getAlIDsAndUsernames,
  getProfilePicture,
  fetchUserById,
  fetchCompanyByEmployeeId,
} from "../api";

import "./Chat.css";
import SocketContext from "../../SocketContext";
import { useNotification } from "../../NotificationContext";
import ChatCard from "./ChatCard";

export default function Chat() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedChatKey, setSelectedChatKey] = useState(null);
  const [newChatInputValue, setNewChatInputValue] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const messagesEndRef = React.useRef(null);
  const [initalLoad, setInitalLoad] = useState(true);
  const activeChatRef = React.useRef(activeChat);
  const selectedChatKeyRef = React.useRef(selectedChatKey);
  const [appUsers, setAppUsers] = useState([]);
  const [localChats, setLocalChats] = useState([]);
  const [profilePictureCache, setProfilePictureCache] = useState(new Map());
  const [profileCache, setProfileCache] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const newChatRecipient = searchParams.get("newChat");

  const { userId } = useAuth();
  const { notification, updateNotification } = useNotification();

  useEffect(() => {
    setLoading(true);
    // Fetch all chats and app users
    const fetchData = async () => {
      let user = userId;
      let data = [];
      if (user !== null) {
        data = await fetchChatDatabyId(user);
      }

      let appUsers = await getAlIDsAndUsernames();
      console.log("App Users: " + appUsers[0].firstName);
      setAppUsers(appUsers);
    };

    // Initialize chat
    const initalizeChat = () => {
      // Check if there is a new chat recipient in the URL
      if (newChatRecipient && newChatRecipient !== userId) {
        console.log("Creating new chat with: " + newChatRecipient);
        createNewChat(newChatRecipient);
        return;
      }

      // Check if there is an active chat in the cookie
      const activeChatIdFromCookie = getCookieValue("activeChatId");
      if (activeChatIdFromCookie) {
        setSelectedChatKey(activeChatIdFromCookie);
        selectedChatKeyRef.current = activeChatIdFromCookie;
      }
    };

    // Fetch data and initialize chat
    initalizeChat();
    fetchData()
      .then(() => {
        console.log("Data fetched successfully - executing the then clause");
        console.log(profileCache);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch data", error);
      });
  }, []);

  // Update the notification state on page load
  useEffect(() => {
    updateNotification(false);
  });

  // Update the active chat when the selected chat changes
  useEffect(() => {
    activeChatRef.current = activeChat;
    scrollToBottom();
  }, [activeChat]);

  // Logic to handle new messages based on socket events
  useEffect(() => {
    const handleNewMessage = async (message) => {
      console.log(message);

      if (message.creator === userId) {
        selectedChatKeyRef.current = message.chatId;
        setSelectedChatKey(message.chatId);
      }

      // Fetch the updated chat data
      let data = await fetchChatsbyUserId(userId);
      data = sortData(data);

      // Update the active chat
      let aC = activeChatRef.current;
      if (selectedChatKeyRef.current !== null && data !== null) {
        // Update the active chat if the number of messages has changed
        const selectedChat = data.find(
          (chat) => chat._id === selectedChatKeyRef.current
        );
        if (selectedChat) {
          if (selectedChat["messages"].length !== aC.length) {
            setActiveChat(selectedChat?.messages || []);
          }
        }
      }
      // Update the chat list with new messages
      setChats(localChats.concat(data));
    };

    // Socket listener for chat messages --> Calls handleNewMessage on "change in chat" event
    socket.on("change in chat", handleNewMessage);

    // Cleanup on component unmount
    return () => {
      socket.off("change in chat", handleNewMessage);
    };
  }, [socket]);

  // Update the chat list when new chats are created
  useEffect(() => {
    let data = chats;
    setChats(localChats.concat(data));
  }, [localChats]);

  // Function to parse cookies and extract the value by name
  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];

  // Function to sort chats based on the last message
  const sortData = (chats) => {
    chats.sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1];
      const lastMessageB = b.messages[b.messages.length - 1];
      if (lastMessageA && lastMessageB) {
        return new Date(lastMessageB.date) - new Date(lastMessageA.date);
      } else if (lastMessageA) {
        return -1;
      } else if (lastMessageB) {
        return 1;
      } else {
        return 0;
      }
    });

    // Move chats without any messages to the beginning (newly created chats)
    const chatsWithNoMessages = chats.filter(
      (chat) => chat.messages.length === 0
    );
    const chatsWithMessages = chats.filter((chat) => chat.messages.length > 0);
    return [...chatsWithNoMessages, ...chatsWithMessages];
  };

  //
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Function to scroll to the bottom of the chat window (invisible messagesEndRef element at the end)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to handle the selection of a new chat recipient
  const handleNewChatInputChange = (selectedOption) => {
    console.log("selctedOption: " + selectedOption.value);
    setNewChatInputValue(selectedOption.value);
  };

  // Function to handle the sending of a new message
  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      try {
        // Create a new message object
        let newMessage = {
          chatID: selectedChatKey,
          message: inputValue,
          sender: userId,
        };

        //clear the input field
        setInputValue("");

        if (activeChat.length === 0) {
          // Create a new chat if there are no messages
          let msg = {
            participants: chats
              .find((chat) => chat._id === selectedChatKey)
              .participants.map((participant) => participant._id),
            message: newMessage,
            creator: userId,
          };
          // Send the "create chat" event to the server via socket to create new chat with first message
          socket.emit("create chat", msg);
        } else {
          // Send the only a new message & the sender to the server via socket
          socket.emit("chat message", { sender: userId, message: newMessage });
        }
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  // Function to remove duplicates from the chat list
  useEffect(() => {
    //rmeoving possible duplicates
    const ids = chats.map((chat) => chat._id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    //if duplicates are found, remove them
    if (duplicates.length > 0) {
      const uniqueChats = chats.filter((chat, index, self) => {
        return index === self.findIndex((t) => t._id === chat._id);
      });
      setChats(uniqueChats);
      console.log("Duplicates removed");
    }
  }, [chats]);

  // Function to handle the creation of a new chat via hidden button
  const handleCreateNewChat = async () => {
    if (newChatInputValue.trim() !== "") {
      // Check if the user is trying to chat with themselves
      if (newChatInputValue === userId) {
        alert("You cannot chat with yourself");
        return;
      }

      // Check if the chat already exists
      if (
        chats.find(
          (chat) =>
            chat.participants[0]._id === newChatInputValue ||
            chat.participants[1]._id === newChatInputValue
        )
      ) {
        alert("Chat already exists");
        return;
      }

      // Check if the user exists
      if (!appUsers.find((user) => user.id === newChatInputValue)) {
        alert("User does not exist");
        return;
      }

      // Check if a user has  been selected
      if (newChatInputValue === null || newChatInputValue === "") {
        alert("Please select a user to chat with");
        return;
      }

      createNewChat(newChatInputValue);
    }
  };

  // Function to create a new chat
  const createNewChat = async (receiverId) => {
    // Fetch the user list and all chats
    let userList = await getAlIDsAndUsernames();
    let allChats = await fetchChatsbyUserId(userId);

    // Check if the user any other newly created chats
    if (localChats === null) {
      localChats = [];
    }

    // Check if the receiver user exists & exit if not
    const receiverUser = userList.find((user) => user.id === receiverId);
    if (!receiverUser) {
      return;
    }

    // Check if chat already exists & set the chat as active
    let existingChat = allChats.find(
      (chat) =>
        chat.participants[0]._id === receiverId ||
        chat.participants[1]._id === receiverId
    );
    if (existingChat) {
      setSelectedChatKey(existingChat._id);
      setActiveChat(existingChat.messages);
      return;
    }

    // Create a new chat object
    let localChat = {
      _id: localChats.length + 1,
      participants: [
        {
          _id: userId,
          name: "You",
        },
        {
          _id: receiverId,
          firstName: receiverUser.firstName,
          lastName: receiverUser.lastName,
        },
      ],
      messages: [],
    };

    //add profile to the cache
    let profile = await fetchUserById(receiverId);
    let profiles = profileCache;
    profiles.set(receiverId, profile);
    setProfileCache(profiles);

    //store the profilePicture in the cache
    let profilePictures = profilePictureCache;
    let profilePicture = await getProfilePicture(receiverId);
    if (Object.keys(profilePicture).length !== 0) {
      profilePictures.set(receiverId, profilePicture);
      setProfilePictureCache(profilePictures);
    }

    // Add the new chat to the local chat list & set it as active
    if (localChats.length !== localChat._id) {
      setLocalChats([localChat]);
      setSelectedChatKey(localChat._id);
    }
    setActiveChat([]);
  };

  const deleteChatbyID = async (chatId) => {
    try {
      console.log("INSIDE Deleting chat with id: " + chatId);
      //await deleteChat(chatId);
      setChats(localChats.concat(await getChatData()));
      console.log("Hello1 " + chatId);
      console.log("Hello2 " + selectedChatKeyRef.current);
      if (chatId === selectedChatKeyRef.current) {
        console.log("Deleting active chat");
        setSelectedChatKey(null);
        activeChatRef.current = [];
        setActiveChat();
        selectedChatKeyRef.current = null;
        Cookies.remove("activeChatId");
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  // Function to fetch chat data
  const getChatData = async () => {
    let data = await fetchChatsbyUserId(userId);
    data = sortData(data);
    return data;
  };

  // Function to fetch chat data & profilePicture for the a user
  const fetchChatDatabyId = async (Id) => {
    console.log("Fetching chat data for user: " + Id);
    // Fetch chat data
    let data = await fetchChatsbyUserId(Id);
    data = sortData(data);

    // Update the chat list
    let allChats = localChats.concat(data);
    setChats(allChats);

    console.log("All Chats: ");
    console.log(allChats);
    console.log("Local Chats: ");
    console.log(localChats);

    //

    // Fetch profile & profile pictures for all chats & store them in their cache
    let profilePictures = profilePictureCache;
    let profiles = profileCache;
    console.log("Profile Pictures: ");
    console.log(profilePictures);
    console.log("All Chats: ");
    console.log(allChats);

    allChats.map(async (chat) => {
      let receiverId = chat.participants.find(
        (participant) => participant._id !== userId
      )._id;
      //check if profile picture is already in cache
      console.log("Checking if profile picture is in cache: " + receiverId);

      console.log(profilePictures.has(receiverId));

      if (!profilePictures.has(receiverId)) {
        let profilePicture = await getProfilePicture(receiverId);

        //only add the profile picture to the cache if it is not an empty object
        if (Object.keys(profilePicture).length !== 0) {
          profilePictures.set(receiverId, profilePicture);
        }
      }

      //check if profile is already in cache
      console.log("Checking if profile is in cache: " + receiverId);
      console.log(profiles.has(receiverId));

      if (!profiles.has(receiverId)) {
        let profile = await fetchUserById(receiverId);
        profiles.set(receiverId, profile);
        console.log("Profile added to cache: " + receiverId);
      }
    });
    setProfileCache(profiles);
    setProfilePictureCache(profilePictures);

    // Update of the active chat
    let aC = activeChat;
    if (initalLoad) {
      // Set the active chat to the chat in the cookie
      let cookieValue = getCookieValue("activeChatId");
      let newAC = data.find((chat) => chat._id === cookieValue)?.messages || [];
      setActiveChat(newAC);
      setInitalLoad(false);
    } else {
      // Update the active chat if the number of messages has changed
      if (selectedChatKey !== null) {
        if (
          data.find((chat) => chat._id === selectedChatKey)["messages"]
            .length !== aC.length
        ) {
          setActiveChat(
            data.find((chat) => chat._id === selectedChatKey)?.messages || []
          );
        }
      }
    }

    return allChats;
  };

  useEffect(() => {
    console.log("profilePictureCache: ");
    console.log(profilePictureCache);
  }, [profilePictureCache]);

  useEffect(() => {
    if (!loading) {
      // Show modal if there are no chats & no new chat created
      if (chats.length === 0 && !newChatRecipient) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [loading, chats]);

  // Function to handle the selection of a chat
  const handleChatSelection = (chatId) => {
    const index = chats.findIndex((chat) => chat._id === chatId);

    // Update the selected chat & active chat
    if (index !== -1) {
      setSelectedChatKey(chatId);
      setActiveChat(chats[index].messages);
      activeChatRef.current = chats[index].messages;
      selectedChatKeyRef.current = chatId;
      Cookies.set("activeChatId", chatId, { expires: 1 });
    }
  };

  // Function to navigate to the profile of the chat partner
  const handleNavigateToProfile = () => {
    const chatPartnerId = chats
      .find((chat) => chat._id === selectedChatKey)
      ?.participants.find((participant) => participant._id !== userId)?._id;
    navigate("/user?id=" + chatPartnerId);
  };

  // Function to navigate to the investment company of the chat partner
  const handleNavigateToInvestementCompany = async () => {
    const chatPartnerId = chats
      .find((chat) => chat._id === selectedChatKey)
      ?.participants.find((participant) => participant._id !== userId)?._id;

    let company = await fetchCompanyByEmployeeId(chatPartnerId);
    navigate("/investment-institution?id=" + company._id);
  };

  const handleNavigateToHome = () => {
    navigate("/startup-overview");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (showModal && !loading) {
    return (
      <Modal show={showModal} onHide={handleNavigateToHome}>
        <Modal.Header closeButton>
          <Modal.Title>No Chats Available</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You currently have no chats available. Find a startup you are
          interested in & start chatting
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNavigateToHome}>
            Find Startup
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Container fluid>
      <Row style={{ paddingTop: "20px", display: "flex" }}>
        {/* Chat List */}
        <Col md={4} style={{ display: "flex" }}>
          <Card style={{ padding: "10px", width: "100%" }}>
            {/* <div> */}
            <div
              style={{
                height: "75px",
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
              }}
            >
              <h1>Chats</h1>
            </div>

            <hr />
            <div
              style={{
                minHeight: "70vh",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              {/* <InputGroup className="mb-3">
                <Select
                  placeholder="Start new chat"
                  name="chatUsers"
                  options={appUsers.map((user) => ({
                    label: user.firstName + " " + user.lastName,
                    value: user.id,
                  }))}
                  className="basic-single"
                  classNamePrefix="select"
                  onChange={handleNewChatInputChange}
                />

                <Button
                  variant="outline-secondary"
                  id="newChat"
                  onClick={handleCreateNewChat}
                >
                  Create
                </Button>
              </InputGroup> */}

              {chats.map((chat, index) => (
                <Card
                  key={chat._id}
                  className={
                    selectedChatKey === chat._id
                      ? "chat-card-selected"
                      : "chat-card"
                  }
                  onClick={() => handleChatSelection(chat._id)}
                  style={{ cursor: "pointer" }}
                >
                  <ChatCard
                    chat={chat}
                    userId={userId}
                    profilePictureCache={profilePictureCache}
                    profile={profileCache}
                  ></ChatCard>
                </Card>
              ))}
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card style={{ padding: "10px", width: "100%" }}>
            {selectedChatKey !== null && (
              <Row style={{ margin: "0px", padding: "0px" }}>
                <Col md={8}>
                  <React.Fragment
                    key={
                      chats
                        .find((chat) => chat._id === selectedChatKey)
                        ?.participants.find(
                          (participant) => participant._id !== userId
                        )?._id
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center" }}
                      onClick={handleNavigateToProfile}
                    >
                      {" "}
                      {/* Added flex container */}
                      {profilePictureCache.get(
                        chats
                          .find((chat) => chat._id === selectedChatKey)
                          ?.participants.find(
                            (participant) => participant._id !== userId
                          )?._id
                      ) ? (
                        <img
                          src={
                            profilePictureCache.get(
                              chats
                                .find((chat) => chat._id === selectedChatKey)
                                ?.participants.find(
                                  (participant) => participant._id !== userId
                                )?._id
                            ).imageUrl
                          }
                          alt="Profile Picture"
                          style={{
                            width: "75px",
                            height: "75px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: "20px",
                          }}
                        />
                      ) : (
                        <FaUserCircle
                          style={{
                            width: "75px",
                            height: "75px",
                            marginRight: "20px",
                          }}
                        />
                      )}
                      <h1>
                        Chat with{" "}
                        {
                          chats
                            .find((chat) => chat._id === selectedChatKey)
                            ?.participants.find(
                              (participant) => participant._id !== userId
                            )?.firstName
                        }
                      </h1>
                    </div>
                  </React.Fragment>
                </Col>
                <Col
                  md={4}
                  style={{
                    height: "75px",
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                  }}
                >
                  {profileCache.get(
                    chats
                      .find((chat) => chat._id === selectedChatKey)
                      ?.participants.find(
                        (participant) => participant._id !== userId
                      )?._id
                  )?.profession === "student" ? (
                    <Button
                      variant="outline-secondary"
                      onClick={handleNavigateToProfile}
                    >
                      See Profile
                    </Button>
                  ) : (
                    <Button
                      variant="outline-success"
                      onClick={handleNavigateToInvestementCompany}
                    >
                      See Investment Company
                    </Button>
                  )}
                </Col>
              </Row>
            )}

            {selectedChatKey === null && <h1>Chat</h1>}
            <hr />
            {/* Selected Chat Messages */}
            {selectedChatKey !== null && activeChat !== null && (
              <div
                style={{
                  minHeight: "65vh",
                  maxHeight: "65vh",
                  overflowY: "auto",
                }}
              >
                {activeChat.map((message, index) => (
                  <Message
                    key={index}
                    messages={message}
                    isSender={message.sender._id === userId}
                  ></Message>
                ))}
                <div ref={messagesEndRef} />{" "}
                {/* Invisible element at the end of the messages */}
              </div>
            )}

            <InputGroup className="mb-3">
              <Form.Control
                aria-label="Enter message"
                aria-describedby="newMessage"
                as={"textarea"}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter message"
                rows={2}
                style={{ resize: "none" }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    inputValue.trim() !== ""
                  ) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant={
                  inputValue.trim() !== "" ? "primary" : "outline-secondary"
                }
                id="newMessage"
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </InputGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
