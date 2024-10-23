import React from "react";
import { Row, Col, Card } from "react-bootstrap";

import "./Chat.css";

export default function Message({ messages, isSender }) {
  return (
    <Row className={isSender ? "justify-content-end" : ""}>
      <Col xs={12} md={5}>
        <Card className={isSender ? "message-sender" : "message-receiver"}>
          <Card.Body>
            {/* <Card.Title>{messages.sender.firstName + " " + messages.sender.lastName}</Card.Title> */}
            <span className="message-text">
              {messages.message} <br />
            </span>
            <small className={isSender ? "footer-sender" : "footer-receiver"}>
              {new Date(messages.date).toLocaleString()}
            </small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
