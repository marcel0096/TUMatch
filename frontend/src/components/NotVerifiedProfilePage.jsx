import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { performLogout, fetchUserById } from "./api";
import LoadingScreen from "../LoadingScreen";

function NotVerifiedProfilePage() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await fetchUserById(userId);
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch user", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, userId]);

  const handleLogout = async () => {
    try {
      const loggedOut = await performLogout();
      if (loggedOut) {
        logout();
      }
      navigate("/logged-out");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <Card className="mt-5">
            <Card.Body>
              <Card.Title>Welcome {user.email}!</Card.Title>
              <br></br>
              Please click on the link in the email we sent you to verify your
              email address
              <br></br>
              <>(email might take some time to arrive).</>
              <br></br>
              <br></br>
              Afterwards you can use all features of TUMatch.
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default NotVerifiedProfilePage;
