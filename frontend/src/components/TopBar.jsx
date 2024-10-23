import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Envelope, EnvelopeExclamation } from "react-bootstrap-icons";
import { performLogout, fetchUserById } from "./api.js";
import { useAuth } from "../AuthContext";
import { FaUserCircle } from "react-icons/fa";
import SocketContext from "../SocketContext";
import { Button } from "react-bootstrap";
import UserSearchBar from "./UserSearchBar.jsx";
import { useNotification } from "../NotificationContext.js";
import tumatchLogo from "../assets/TUMatch_logo.png";
import { FaSearch } from "react-icons/fa";
import { fetchStartupByUserId } from "./api.js";
import { Toast } from "react-bootstrap";
import {
  FaUserEdit,
  FaBuilding,
  FaRss,
  FaKey,
  FaSignOutAlt,
} from "react-icons/fa";

function TopBar() {
  const { isLoggedIn, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [profession, setProfession] = useState(null);
  const socket = useContext(SocketContext);
  const { newNotification, updateNotification } = useNotification();
  const [chatNotification, setChatNotification] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [sender, setSender] = useState(null);
  const [message, setMessage] = useState(null);

  const toggleSearchBar = () => setShowSearchBar(!showSearchBar);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (isLoggedIn && userId) {
          const userData = await fetchUserById(userId);
          setProfession(userData.profession); // evtl wird hier zu spät gesetzt / mit await?
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture.imageUrl);
          } else {
            setProfilePicture(null);
          }
          socket.emit("login message", userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [isLoggedIn, userId, navigate]);

  useEffect(() => {
    setChatNotification(newNotification);
  }, [newNotification]);

  useEffect(() => {
    socket.on("message notification", (msg) => handleNotification(msg));
  }, [socket]);

  const handleNotification = async (msg) => {
    console.log("notification received");
    console.log(msg);
    console.log(msg.message.message);
    let sender = await fetchUserById(msg.sender);
    let message = msg.message.message;
    setSender(sender);
    setMessage(message);
    setShowToast(true);
    //console.log("notification received");
    updateNotification(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      const loggedOut = await performLogout();
      if (loggedOut) {
        logout(); // logout in local state -> set flag to false and user to null
        navigate("/logged-out");
      }
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const handleMyProfile = () => {
    if (profession === "student") {
      navigate("/user");
    } else {
      navigate("/edit-investor");
    }
  };

  const handleMyStartup = async () => {
    let startup = null;
    try {
      startup = await fetchStartupByUserId(userId);
    } catch (error) {
      console.error("Error fetching startup data:", error);
    }
    if (!startup) {
      console.error("Startup not found");
      navigate("/edit-startup");
    } else {
      console.log("startup", startup);
      navigate("/startup?id=" + startup._id);
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleMyInvestmentInstitution = () => {
    navigate("/investment-institution");
  };

  const handleMySubscription = () => {
    navigate("/SubscriptionInfoPage"); //   /payment-plan
  };
  const handleChat = () => {
    navigate("/chat");
  };

  const handleToastClick = () => {
    setShowToast(false);
    navigate("/chat?newChat=" + sender._id);
  };

  return (
    <div>
      <Row
        style={{ padding: "0px", margin: "0px" }}
        className="d-flex justify-content-start align-items-center"
      >
        <Navbar
          className="custom-navbar"
          style={{
            position: "fixed",
            zIndex: "1000",
            top: "0",
            left: "0",
            right: "0",
            width: "100%",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "0px",
            paddingBottom: "0px",
            backgroundColor: isLoggedIn
              ? profession === "investor"
                ? "#1c3933"
                : "#1B386A" // check profession somewhere else
              : "#1B386A",
          }}
          variant="dark"
          expand="lg"
        >
          <Col
            sm={8}
            className="d-flex justify-content-start align-items-center"
          >
            <div className="d-block d-lg-inline">
              <Navbar.Brand href={isLoggedIn ? "startup-overview" : "login"}>
                <img
                  src={tumatchLogo}
                  alt="TUMatch"
                  style={{
                    padding: "0px",
                    paddingRight: "10px",
                    margin: "0px",
                    height: "50px",
                    filter: "brightness(0) invert(1)",
                  }} // Adjust the size as needed
                />{" "}
              </Navbar.Brand>
            </div>

            <div
              className="d-block d-lg-inline"
              style={{ color: "white", fontWeight: "bold" }}
            >
              A hyperlocal matching platform
            </div>
          </Col>

          {isLoggedIn && (
            <Col
              sm={4}
              className="d-flex justify-content-end align-items-center"
            >
              <>
                {/* Show search icon only on small screens */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  className="d-lg-none"
                >
                  <FaSearch
                    color="white"
                    size={30}
                    style={{
                      marginLeft: "15px",
                      marginRight: "30px",
                      cursor: "pointer",
                    }}
                    className="mx-3"
                    onClick={toggleSearchBar}
                  />
                  {showSearchBar && <UserSearchBar />}
                </div>
                {/* Show UserSearchBar directly on md and larger screens */}
                <div className="d-none d-lg-inline mx-3">
                  <UserSearchBar />
                </div>

                {/* <Nav className="ms-auto"> */}
                <div className="d-block d-lg-inline">
                  {chatNotification ? (
                    <EnvelopeExclamation
                      color="white"
                      size={30}
                      style={{
                        marginLeft: "15px",
                        marginRight: "15",
                        cursor: "pointer",
                      }}
                      className="mx-3"
                      onClick={handleChat}
                    />
                  ) : (
                    <Envelope
                      color="white"
                      size={30}
                      style={{
                        cursor: "pointer",
                      }}
                      className="mx-3"
                      onClick={handleChat}
                    />
                  )}
                </div>

                <div className="d-block d-lg-inline">
                  <Dropdown align="end" color="white">
                    <Dropdown.Toggle
                      as="a"
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        color: "white",
                      }}
                      className="mx-3"
                    >
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <FaUserCircle
                          style={{
                            width: "30px",
                            height: "30px",
                            color: "white",
                          }}
                        ></FaUserCircle>
                      )}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={handleMyProfile}>
                        {profession === "student" ? (
                          <>
                            <FaUserCircle className="icon" /> My Profile
                          </>
                        ) : (
                          <>
                            <FaUserEdit className="icon" /> Edit Profile
                          </>
                        )}
                      </Dropdown.Item>
                      {profession === "student" ? (
                        <Dropdown.Item onClick={handleMyStartup}>
                          <>
                            <FaBuilding className="icon" /> My Startup
                          </>
                        </Dropdown.Item>
                      ) : (
                        <>
                          <Dropdown.Item
                            onClick={handleMyInvestmentInstitution}
                          >
                            <>
                              <FaBuilding className="icon" /> My Company
                            </>
                          </Dropdown.Item>
                          <Dropdown.Item onClick={handleMySubscription}>
                            <>
                              <FaRss className="icon" /> My Subscription
                            </>
                          </Dropdown.Item>
                        </>
                      )}
                      <Dropdown.Item onClick={handleChangePassword}>
                        <>
                          <FaKey className="icon" /> Change Password
                        </>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>
                        <>
                          <FaSignOutAlt className="icon" /> Log out
                        </>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {/* </Nav>             */}
              </>
            </Col>
          )}
        </Navbar>
      </Row>

      {showToast && chatNotification && (
        <div
          className="toast-container"
          style={{
            zIndex: 1000,
            position: "fixed",
            top: 0,
            right: 0,
            margin: "20px",
            marginTop: "50px",
            backgroundColor: "#fff", // Non-transparent background color
            fontSize: "1.2rem",
          }}
        >
          {/* This is a placeholder for a Toast component. Replace it with your Toast component */}
          {/* If using React-Bootstrap, you might have something like this:*/}
          <Toast
            onClose={() => setShowToast(false)}
            conClick={handleToastClick}
            show={showToast}
            delay={3000}
            autohide
            style={{ backgroundColor: "#fff", fontSize: "1.2rem" }} // Apply styles directly to the Toast if needed
          >
            <Toast.Header style={{ backgroundColor: "#f8f9fa" }}>
              <strong className="me-auto">
                Message from {sender.firstName + " " + sender.lastName}
              </strong>
            </Toast.Header>
            <Toast.Body>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <h5 style={{ margin: 0 }}>{message}</h5>
                <Button variant="outline-secondary" onClick={handleToastClick}>
                  See chat
                </Button>
              </div>
            </Toast.Body>
          </Toast>
        </div>
      )}
    </div>
  );
}

export default TopBar;
