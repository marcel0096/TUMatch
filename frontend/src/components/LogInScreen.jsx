import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { performLogin } from "./api";
import { useAuth } from "../AuthContext";
import Cookies from "js-cookie";
import "./LoginSignUpPage.css";
import tumatchLogo from "../assets/TUMatch_logo.png";
import ErrorModal from "./ErrorModal";

function LogInScreen() {
  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/startup-overview"; // Fallback path if no state is passed
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if credentials are saved in cookies
    const savedEmail = Cookies.get("email");
    const savedPassword = Cookies.get("password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (rememberMe) {
      Cookies.set("email", email, { expires: 7 });
      Cookies.set("password", password, { expires: 7 });
    } else {
      Cookies.remove("email");
      Cookies.remove("password");
    }
    try {
      const loginData = await performLogin(email, password);
      setPassword("");
      setEmail("");
      if (loginData["success"] === true) {
        login(
          loginData["userId"],
          loginData["profession"],
          loginData["validSubscription"],
          loginData["verifiedEmail"]
        );
        navigate(from);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setPassword("");
      setShowError(true);
      setErrorMessage("Wrong email or password.");
    }
  }

  function navigateToSignup() {
    navigate("/signup");
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
          <h3 className="text-center mt-1">Log In</h3>
          <p className="text-center mb-3">
            Welcome back! Please enter your details.
          </p>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Email address
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-2">
              <Form.Label className="bold-label required-asterisk">
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Row className="d-flex align-items-center justify-content-between">
              <Col xs="auto">
                <Form.Group controlId="formBasicCheckbox" className="mb-0">
                  <Form.Switch
                    type="checkbox"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={handleRememberMe}
                  />
                </Form.Group>
              </Col>
              <Col xs="auto" className="d-flex justify-content-end mb-1">
                <Button
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                  variant="link"
                >
                  Forgot password?
                </Button>
              </Col>
            </Row>
            <Button variant="primary" type="submit" className="w-100 mt-0 mb-3">
              Log in
            </Button>
          </Form>
          <Row className="justify-content-center align-items-center">
            <Col xs="auto">Don't have an account yet?</Col>
            <Col xs="auto">
              <Button variant="link" onClick={navigateToSignup}>
                Sign up here
              </Button>
            </Col>
          </Row>
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

export default LogInScreen;
