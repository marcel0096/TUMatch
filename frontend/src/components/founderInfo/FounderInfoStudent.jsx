import { Row, Col, Card } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function FounderInfoStudent({ founders }) {
  return (
    <Col md={12}>
      <Card>
        <Card.Body
          className="d-flex flex-column justify-content-center"
          style={{ height: "100%" }}
        >
          <h2
            style={{
              textAlign: "left",
              marginBottom: "20px",
            }}
          >
            Founder.
          </h2>
          <Row className="align-items-center" style={{ textAlign: "left" }}>
            {founders.map((founder, index) => (
              <Col
                className="justify-content-center align-items-center"
                md={6}
                key={index}
              >
                <Row
                  className="align-items-center justify-content-center"
                  style={{ marginBottom: "10px", marginTop: "10px" }}
                >
                  <Col
                    md={12}
                    lg={6}
                    className="align-items-center justify-content-center"
                  >
                    {founder.profilePicture ? (
                      <a href={`/user?id=${founder._id}`}>
                        <img
                          src={founder.profilePicture.imageUrl}
                          alt="Profile"
                          style={{
                            width: "80%",
                            minWidth: "80px",
                            height: "auto",
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                        />
                      </a>
                    ) : (
                      <a href={`/user?id=${founder._id}`}>
                        <FaUserCircle
                          style={{
                            fill: "black",
                            width: "80%",
                            minWidth: "80px",
                            height: "auto",
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                        ></FaUserCircle>
                      </a>
                    )}
                  </Col>
                  <Col md={12} lg={6}>
                    <h2>{founder.firstName + " " + founder.lastName} </h2>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
}
