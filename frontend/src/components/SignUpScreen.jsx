import React, { useEffect, useState } from "react";
import { Container, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { generateVerificationToken, performSignup } from "./api";
import tumatchLogo from "../assets/TUMatch_logo.png";
import ErrorModal from "./ErrorModal";

function SignUpScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [profession, setProfession] = useState("");
  const [validated, setValidated] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCorrectFormat, setIsCorrectFormat] = useState(false);

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    await validateEmail(
      form.formBasicEmail.value,
      form.formBasicProfession.value
    );
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowError(true);
      setErrorMessage("Please enter all fields correctly.");
    } else {
      try {
        const signupData = await performSignup(email, password, profession);
        setPassword("");
        setEmail("");
        if (signupData["success"] === true) {
          login(
            signupData["userId"],
            signupData["profession"],
            signupData["validSubscription"],
            signupData["verifiedEmail"]
          );
          generateVerificationToken(signupData["userId"]);
          setProfession("");
          navigate("/unverified-profile");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
    setValidated(true);
  }

  function navigateToLogin() {
    navigate("/login");
  }

  async function validateEmail(email, profession) {
    const studentEmailPattern = /^[a-zA-Z0-9._%+-]+@tum.de$/;
    const generalEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/;
    if (profession === "student") {
      setIsCorrectFormat(studentEmailPattern.test(email));
    } else {
      setIsCorrectFormat(generalEmailPattern.test(email));
    }
  }

  return (
    <Container
      fluid
      className="login-container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="justify-content-md-center align-content-center">
        <Col xs={12} md={6} lg={8} xl={6} className="login-box">
          <img src={tumatchLogo} alt="logo" className="login-logo" />
          <h3 className="text-center mt-1">Sign Up</h3>
          <p className="text-center mb-3">
            Welcome to TUMatch! <br></br>Create your account right here below.
          </p>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Email address
              </Form.Label>

              <Form.Control
                type="email"
                placeholder={
                  profession === "student"
                    ? "Enter email address (@tum.de)"
                    : "Enter email address"
                }
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
                pattern={
                  profession === "student"
                    ? isCorrectFormat
                      ? "*"
                      : ""
                    : "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+"
                }
              />
              <Form.Control.Feedback type="invalid">
                {profession === "student"
                  ? "Email must end with @tum.de."
                  : "Please enter a valid email address."}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                isInvalid={validated && password.length < 8}
              />
              <Form.Control.Feedback type="invalid">
                {password.length < 8
                  ? "Password must be at least 8 characters long."
                  : "Please enter a password."}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formPasswordRepeated" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={passwordRepeat}
                onChange={(e) => {
                  setPasswordRepeat(e.target.value);
                }}
                required
                pattern={password}
                isInvalid={validated && passwordRepeat !== password}
              />
              <Form.Control.Feedback type="invalid">
                {passwordRepeat !== password
                  ? "Passwords do not match."
                  : "Please repeat your password."}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formBasicProfession" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Profession
              </Form.Label>
              <Form.Control
                as="select"
                value={profession}
                onChange={(e) => {
                  setProfession(e.target.value);
                }}
                required
              >
                <option value="">Select...</option>
                <option value="student">Student</option>
                <option value="investor">Investor</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Please choose a profession.
              </Form.Control.Feedback>
            </Form.Group>

            <p className="text-muted mt-0">
              <span style={{ color: "red" }}>*</span> required field
            </p>
            <Button variant="primary" type="submit" className="w-100 mt-0 mb-2">
              Sign me up
            </Button>
            <Row className="justify-content-center align-items-center">
              <Col xs="auto">Already have an account?</Col>
              <Col xs="auto">
                <Button variant="link" onClick={navigateToLogin}>
                  Log in here
                </Button>
              </Col>
            </Row>
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
}

export default SignUpScreen;
