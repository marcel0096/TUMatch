import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import tumatchLogo from "../assets/TUMatch_logo.png";
import { Cursor } from "react-bootstrap-icons";
import "../App.css";

function Footer() {
  return (
    <div
      className="footer"
      style={{
        left: 0,
        width: "100%",
        backgroundColor: "rgba(213, 213, 213, 1.0)",
        zIndex: 1000,
      }}
    >
      {" "}
      {/* Adjusted padding */}
      <Container fluid style={{ margin: "0px" }}>
        <Row
          style={{ marginBottom: "0px", marginTop: "0px" }}
          className="d-flex justify-content-between align-items-center"
        >
          <Col xs={4} md={2} className="">
            <img src={tumatchLogo} alt="TUMatch" style={{ height: "30px" }} />
          </Col>
          <Col xs={8} md={10}>
            <Nav
              className="d-flex align-items-md-center justify-content-end"
              style={{ width: "100%", padding: "0px", margin: "0px" }}
            >
              <Nav.Link href="/terms-of-use" className="footer-text">
                Terms of Use
              </Nav.Link>
              <Nav.Link href="/contact-us" className="footer-text">
                Contact Us
              </Nav.Link>
              <Nav.Link href="/privacy-policy" className="footer-text">
                Privacy Policy
              </Nav.Link>
              <span style={{ paddingLeft: "10px" }} className="footer-text">
                © TUMatch 2024
              </span>
            </Nav>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Footer;
