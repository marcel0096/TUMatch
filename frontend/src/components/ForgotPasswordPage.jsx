import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import ErrorModal from "./ErrorModal";
import tumatchLogo from "../assets/TUMatch_logo.png";
import { useState } from "react";
import { performForgotPassword } from "./api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validated, setValidated] = useState(false);

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowError(true);
      setErrorMessage("Please enter a valid email address.");
    } else {
      try {
        const response = await performForgotPassword(email);
        if (
          response["message"] ===
          "If an account with that email exists, a password reset link has been sent to your email."
        ) {
          setShowError(true);
          setErrorMessage(response["message"]);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  }

  return (
    <Container
      fluid
      className="login-container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="justify-content-md-center align-content-center">
        <Col
          xs={12}
          md={6}
          lg={8}
          xl={6}
          className="login-box justify-content-md-center align-conent-center"
        >
          <img src={tumatchLogo} alt="logo" className="login-logo" />
          <h3 className="text-center mt-1">Reset password</h3>
          <p className="text-center mb-3">
            Enter your email address to receive a password reset link.
          </p>
          <Form onSubmit={handleSubmit} noValidate validated={validated}>
            <Form.Group controlId="formBasicEmail" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Email address
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern={"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+"}
              />
              <Form.Control.Feedback type="invalid">
                {"Please enter a valid email address."}
              </Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3 mb-3">
              {" "}
              Reset password
            </Button>
          </Form>
        </Col>
      </Row>
      <ErrorModal
        showError={showError}
        errorMessage={errorMessage}
        handleCloseErrorModal={handleCloseErrorModal}
      ></ErrorModal>
    </Container>
  );
};

export default ForgotPasswordPage;
