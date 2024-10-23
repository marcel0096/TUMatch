import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Alert } from "react-bootstrap";
import { useAuth } from "../AuthContext";

function UserDeletedPage() {
  const navigate = useNavigate();
  const countdownLength = 10;
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
    }, (countdownLength * 1000) / countdownLength);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <Container className="mt-5">
      <h1>We are sorry to see you leave...</h1>
      <Alert variant="success">
        You have successfully deleted your profile. You will be automatically
        redirected to the home page in {countdown} seconds...
      </Alert>
      <Button variant="primary" onClick={() => navigate("/")}>
        Go to Home Page
      </Button>
    </Container>
  );
}
export default UserDeletedPage;
