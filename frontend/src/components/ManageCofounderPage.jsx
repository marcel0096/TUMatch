import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Card,
} from "react-bootstrap";
import {
  fetchStartupByUserId,
  getNewInvitationCode,
  fetchUserById,
} from "./api";
import { useAuth } from "../AuthContext";
import { FaTrash, FaUserCircle } from "react-icons/fa";
import LoadingScreen from "../LoadingScreen";

export default function ManageCoFounderPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [startupId, setStartupId] = useState(null);
  const [startupName, setStartupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitationLink, setInvitationLink] = useState("");
  const invitationLinkPre = "http://localhost:3000/invite?startupCode=";
  const [coFounders, setCoFounders] = useState([]);
  const [coFounderDetails, setCoFounderDetails] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [memberIndexToRemove, setMemberIndexToRemove] = useState(null);

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        let startup = null;

        setLoading(true);
        startup = await fetchStartupByUserId(userId);
        setStartupId(startup._id);
        setCoFounders(startup.coFounders);
        setStartupName(startup.startupName);
        setInvitationLink(invitationLinkPre + startup.invitationCode[0] || "");
      } catch (error) {
        console.error("Error fetching startup data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartupData();
  }, [userId, navigate]);

  useEffect(() => {
    async function fetchCoFounderDetails() {
      const userDetails = await Promise.all(
        coFounders.map(async (userId) => {
          const user = await fetchUserById(userId);
          let userProfilePicture;
          if (user.profilePicture && user.profilePicture.data) {
            userProfilePicture = user.profilePicture.imageUrl;
          } else {
            userProfilePicture = null;
          }
          console.log(user);
          return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profession: user.profession,
            profilePicture: userProfilePicture,
          };
        })
      );
      setCoFounderDetails(userDetails);
    }
    if (coFounders && coFounders.length > 0) {
      fetchCoFounderDetails();
    }
  }, [coFounders]);

  const handleDeleteClick = (index) => {
    setShowDeleteConfirmation(true);
    setMemberIndexToRemove(index);
  };

  async function deleteStartup() {
    try {
      const response = await fetch(
        `http://localhost:8080/startups/delete/${startupId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        const text = await response.text();
        console.error("Unable to delete startup: ", text);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  async function removeCoFounderFromStartup() {
    try {
      const coFounderId = coFounders[memberIndexToRemove];
      const requestBody = JSON.stringify({ _id: coFounderId });

      const response = await fetch(
        "http://localhost:8080/startups/removeCofounderByID",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
          credentials: "include",
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        const text = await response.text();
        alert("Oops! Something went wrong. Please try again.");
        // setShowError(true);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  const confirmDelete = () => {
    if (coFounders.length === 1) {
      handleRemoveCofounder(memberIndexToRemove);
      deleteStartup(); // deletes the startup at all when its the last cofounder
      setShowDeleteConfirmation(false);
      setMemberIndexToRemove(null);
    } else {
      handleRemoveCofounder(memberIndexToRemove);
      removeCoFounderFromStartup(); // delete employee from startup
      setShowDeleteConfirmation(false);
      setMemberIndexToRemove(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setMemberIndexToRemove(null);
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      alert("Invitation link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const createNewInvitationLink = async () => {
    try {
      let data = await getNewInvitationCode(startupId, "startups");
      setInvitationLink(invitationLinkPre + data.code);
    } catch (error) {
      console.error("Error fetching new invitation code:", error);
    }
  };

  const handleRemoveCofounder = (index) => {
    const newCofounders = [...coFounders];
    newCofounders.splice(index, 1);
    console.log(newCofounders);
    setCoFounders(newCofounders);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="edit-container">
      <h1 className="edit-container">Manage co-founders of {startupName}!</h1>

      {startupId && (
        <Container>
          <h3 className="custom-heading">Co-founders</h3>
          <Row>
            {coFounders &&
              coFounderDetails.map((member, index) => (
                <Col md={4} key={index} className="mb-4">
                  <Card
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "0.25rem",
                      height: "100%",
                    }}
                  >
                    <Card.Body>
                      <Row>
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={`${member.firstName} ${member.lastName}`}
                            style={{ width: "100%", borderRadius: "50%" }}
                          />
                        ) : (
                          <FaUserCircle
                            style={{ width: "100%", height: "100%" }}
                          ></FaUserCircle>
                        )}
                      </Row>
                      <Row className="mt-2">
                        <Card.Title
                          style={{ textAlign: "center" }}
                        >{`${member.firstName} ${member.lastName}`}</Card.Title>
                      </Row>
                      <Row className="mt-2">
                        <Card.Text
                          style={{ textAlign: "center", color: "grey" }}
                        >
                          {member.position}
                        </Card.Text>
                      </Row>
                      <Row className="mt-2">
                        <Button
                          variant="outline-danger"
                          style={{ margin: "auto" }} // Centers the button in the row
                          onClick={() => handleDeleteClick(index)}
                        >
                          <FaTrash style={{ marginRight: "5px" }} />
                          Remove
                        </Button>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Container>
      )}

      {startupId && (
        <Container>
          <h3 className="custom-heading">Invite new co-founders</h3>
          <Row className="mt-3 align-items-center justify-content-center">
            <Col md={11} className="align-items-center justify-content-center">
              <Form.Group>
                <Form.Control type="text" value={invitationLink} readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3 align-items-center justify-content-center">
            <Col md={4} className=" align-items-center justify-content-center">
              <Button variant="outline-secondary" onClick={copyInvitationLink}>
                Copy Invitation Link
              </Button>
            </Col>
            <Col md={4} className=" align-items-center justify-content-center">
              <Button
                variant="outline-secondary"
                onClick={createNewInvitationLink}
              >
                Create new invitation link
              </Button>
            </Col>
          </Row>
        </Container>
      )}

      <Modal show={showDeleteConfirmation} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {coFounders.length === 1
            ? "Are you sure you want to remove this user? This will also delete your associated startup."
            : "Are you sure you want to remove this user from your startup?"}
          {/* {`Are you sure you want to delete from your startup?`} */}
          {/* ${coFounderDetails[memberIndexToRemove].firstName} */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
