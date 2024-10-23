import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function FounderInfoInvestor({ founders }) {
  const navigate = useNavigate();

  const navigateToProfile = (id) => {
    navigate(`/user?id=${id}`);
  };
  return (
    <Row
      className="align-items-center justify-content-start"
      style={{ marginBottom: "0px", padding: 0 }}
    >
      {founders.map((founder, index) => (
        <Col md={4} key={index} style={{ height: "100%" }}>
          <Card style={{ height: "100%" }}>
            <Card.Body className="d-flex flex-column">
              <Container style={{ paddingBottom: "10px" }}>
                {founder.profilePicture ? (
                  <img
                    src={founder.profilePicture.imageUrl}
                    alt="Profile"
                    style={{
                      width: "60%",
                      height: "auto",
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => navigateToProfile(founder._id)}
                  />
                ) : (
                  <FaUserCircle
                    style={{
                      width: "60%",
                      height: "auto",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => navigateToProfile(founder._id)}
                  ></FaUserCircle>
                )}
              </Container>
              <h2 style={{ textAlign: "left" }}>
                {founder.firstName + " " + founder.lastName}
              </h2>
              <Col className="d-flex flex-column justify-content-between">
                <p className="descriptionText">{founder.selfDescription}</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigateToProfile(founder._id)}
                  >
                    See Profile
                  </Button>
                </div>
              </Col>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
