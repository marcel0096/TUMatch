import React from "react";
import { Button, Modal } from "react-bootstrap";

export default function ErrorModal({
  showError,
  errorMessage,
  handleCloseErrorModal,
}) {
  return (
    <Modal show={showError} onHide={handleCloseErrorModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>{errorMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseErrorModal}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
