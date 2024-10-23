import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Alert, Row, Col } from "react-bootstrap";
import tumatchLogo from "../assets/TUMatch_logo.png";

function LoggedOutPage() {
  const navigate = useNavigate();
  const countdownLength = 20;
  const [countdown, setCountdown] = useState(countdownLength);

  useEffect(() => {
    // Set up an interval to decrease the countdown every second
    const interval = setInterval(() => {
      setCountdown((currentCountdown) => {
        if (currentCountdown <= 1) {
          clearInterval(interval); // Clear interval when countdown reaches 0
          navigate("/"); // Redirect when countdown reaches 0
          return 0;
        }
        return currentCountdown - 1;
      });
    }, 1000); // Fixed to decrease every second

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="page-content">
      <Container className="mt-5">
        <Alert variant="success">
          You have successfully logged out. You will be automatically redirected
          to the home page in {countdown} seconds...
        </Alert>
        <Row className="justify-content-md-center align-items-center">
          <Col md={8} className="text-center">
            <h2>Hope you found the startup, you were looking for!</h2>
            <Row className="justify-content-center align-items-center mt-4">
              <img
                src={tumatchLogo}
                alt="TUMatch"
                className=""
                style={{ width: "250px", height: "auto" }}
              />
            </Row>
            <p>Thank You for Visiting Our Platform! </p>
            <br />
            <p>We hope you made some valuable connections along the way.</p>
            <p>
              Our platform is constantly evolving, with new startups and
              opportunities being added regularly..
            </p>
            <br />
            <p>
              Remember, great opportunities don't come by every day. So, don't
              hesitate to come back and explore new possibilities or to further
              develop the connections you've already made.
              <br />{" "}
              <b>Your next big opportunity might just be a click away!</b>
            </p>
            <Button variant="primary" onClick={() => navigate("/landing-page")}>
              Go to Home Page
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoggedOutPage;
