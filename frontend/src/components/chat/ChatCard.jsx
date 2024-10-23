import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import "./Chat.css";
import { FaUserCircle } from "react-icons/fa";

export default function ChatCard({ chat, userId, profilePictureCache }) {
  return (
    <>
      <Card.Body>
        <Card.Title>
          {chat.participants.map(
            (participant, participantIndex) =>
              participant._id !== userId && (
                <React.Fragment key={participantIndex}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {" "}
                    {/* Added flex container */}
                    {profilePictureCache.get(participant._id) ? (
                      <img
                        src={profilePictureCache.get(participant._id).imageUrl}
                        alt={`${participant.firstName} ${participant.lastName}'s Profile`}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: "10px", // Added margin to separate the profile picture from the name
                        }}
                      />
                    ) : (
                      <FaUserCircle
                        style={{
                          width: "60px", // Adjusted to match the size of the profile pictures
                          height: "60px",
                          marginRight: "10px", // Added margin to separate the profile picture from the name
                        }}
                      />
                    )}
                    <h3>
                      {participant.firstName + " " + participant.lastName}
                    </h3>
                  </div>
                </React.Fragment>
              )
          )}
        </Card.Title>
        <Card.Text>
          {chat.messages.length > 0
            ? //if true, return the last message and its sender ("You" if the message was send by the current user, else the other name), else return "No messages"
              chat.messages[chat.messages.length - 1].sender._id === userId
              ? "You: " + chat.messages[chat.messages.length - 1].message
              : chat.messages[chat.messages.length - 1].sender.firstName +
                ": " +
                chat.messages[chat.messages.length - 1].message
            : "No messages"}
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <Row style={{ padding: "0px", margin: "0px" }}>
          <Col style={{ textAlign: "right" }}>
            <small>
              {chat.messages.length > 0 ? (
                <>
                  {new Date(
                    chat.messages[chat.messages.length - 1].date
                  ).toLocaleString()}
                </>
              ) : (
                "No messages"
              )}
            </small>
          </Col>
        </Row>
      </Card.Footer>
    </>
  );
}
