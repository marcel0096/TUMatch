import React, { useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { performChangePassword } from "./api";
import tumatchLogo from "../assets/TUMatch_logo.png";
import ErrorModal from "./ErrorModal";

import "./LoginSignUpPage.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setcurrentPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [validated, setValidated] = useState(false);

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowError(true);
      setErrorMessage("Please enter all fields correctly.");
      setValidationMessage("");
    } else {
      try {
        let response = await performChangePassword(
          currentPassword,
          newPassword
        );

        if (response.status !== 200) {
          setValidationMessage("Invalid User Input");
          return;
        }

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        navigate("/startup-overview");
      } catch (error) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowError(true);
        setErrorMessage("An error occurred. Please try again.");
      }
    }
    setValidated(true);
  };

  return (
    <Container
      fluid
      className="login-container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <ErrorModal
        showError={showError}
        errorMessage={errorMessage}
        handleCloseErrorModal={handleCloseErrorModal}
      />
      <Row className="justify-content-md-center align-content-center">
        <Col xs={12} md={6} lg={8} xl={6} className="login-box p-5">
          <img src={tumatchLogo} alt="logo" className="login-logo" />
          <h3 className="text-center mt-1 mx-5">Change Password</h3>
          <p className="text-center mb-3">Please enter your new password.</p>
          <Form
            noValidate
            validated={validated}
            onSubmit={handleChangePassword}
          >
            <Form.Group controlId="currentPassword" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Current Password
              </Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setcurrentPassword(e.target.value)}
                required
                minLength={8}
                //isInvalid={validated && currentPassword.length < 8}
              />
              <Form.Control.Feedback type="invalid">
                {currentPassword.length < 8
                  ? "Password are at least 8 characters long."
                  : "Please enter a password."}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="newPassword" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                New Password
              </Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                //isInvalid={validated && newPassword.length < 8}
              />
              <Form.Control.Feedback type="invalid">
                {newPassword.length < 8
                  ? "Password must be at least 8 characters long."
                  : "Please enter a password."}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Confirm New Password
              </Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                pattern={newPassword}
                //isInvalid={validated && confirmPassword !== newPassword}
              />

              <Form.Control.Feedback type="invalid">
                {confirmPassword !== newPassword
                  ? "Passwords do not match."
                  : "Please repeat your password."}
              </Form.Control.Feedback>
            </Form.Group>
            {validationMessage && (
              <div className="text-danger mb-3">{validationMessage}</div>
            )}
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
