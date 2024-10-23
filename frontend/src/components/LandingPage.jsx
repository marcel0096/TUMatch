import React, { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import landingPageImage from "../assets/landing_page_image.jpeg";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import TumMatchLogo from "../assets/TUMatch_logo.png";

export default function LandingPage() {
  useEffect(() => {
    // Add class to body to make it non-scrollable
    document.body.classList.add("no-scroll");

    // Cleanup to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);
  const navigate = useNavigate();

  //change this to the correct path
  const navigateToLogIn = () => {
    navigate("/login");
  };
  const nagivateToSignUp = () => {
    navigate("/signup");
  };

  return (
    <Container fluid className="landing-page">
      <Row className="g-0">
        <Col md={7} className="image-column">
          <img
            src={landingPageImage}
            alt="Landing Page"
            className="landing-image"
          />
        </Col>
        <Col
          md={5}
          className="text-column d-flex flex-column justify-content-center align-items-center"
        >
          <img
            src={TumMatchLogo}
            alt="TUMatch"
            style={{ width: "350px", height: "auto", paddingBottom: "150px" }}
          />
          <h1>Welcome!</h1>
          <p className="custom-subheading">
            a hyperlocal co-founder matching platform
          </p>
          <div className="button-group pb-md-5">
            <Button variant="primary" className="m-2" onClick={navigateToLogIn}>
              Log In
            </Button>
            <Button
              variant="secondary"
              className="m-2"
              onClick={nagivateToSignUp}
            >
              Sign Up
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
