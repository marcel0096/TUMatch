import { Spinner, Container } from "react-bootstrap";

export default function LoadingScreen() {
  return (
    <Container style={{ position: "fixed", top: "50%", left: "50%" }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );
}
