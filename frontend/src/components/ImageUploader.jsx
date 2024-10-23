import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import "./ImageUploader.css";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaUpload, FaCheck } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import AvatarEditor from "react-avatar-editor";
import ErrorModal from "./ErrorModal";

export default function ImageUploader({
  fetchData,
  imageUrlExtractor,
  handleImageSave,
  initialImageUrl,
  heading,
  uploadInfo,
  classType,
}) {
  const { isLoggedIn, userId } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [editedImage, setEditedImage] = useState(null);
  const [initialImage, setInitialImage] = useState(initialImageUrl);
  const [editMode, setEditMode] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        if (!isLoggedIn || !userId) {
          console.error("User is not logged in");
          navigate("/");
          return;
        }
        const data = await fetchData();
        const initialImageFromDB = imageUrlExtractor(data);
        setInitialImage(initialImageFromDB);
        setSelectedImage(initialImageFromDB);
        setEditedImage(initialImageFromDB);
      } catch (error) {
        console.info(
          "Error fetching image data (probably because the startup does not exist yet):",
          error
        );
      }
    };

    fetchDataAsync();
  }, [isLoggedIn, userId, navigate]);

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validImageTypes.includes(fileType)) {
        setShowError(true);
        setErrorMessage("Only .png, .jpg, and .jpeg files are allowed.");
        return;
      }

      if (file.size > maxSize) {
        setShowError(true);
        setErrorMessage("Your image size must not exceed 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setEditedImage(null);
        setEditMode(true);
      };
      reader.readAsDataURL(file);
      setScale(1);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      const canvas = editorRef.current.getImage();
      const dataURL = canvas.toDataURL();
      setEditedImage(dataURL);
      setEditMode(false);
      handleImageSave(dataURL); // Call the callback to save the image
    }
  };

  const handleDiscardChanges = () => {
    setSelectedImage(initialImage);
    setScale(1);
    setEditMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setEditedImage(null);
    setScale(1);
    setEditMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    handleImageSave("");
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    handleDeleteImage(); // delete image
    setShowDeleteConfirmation(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <>
      <Container>
        <h3 className="custom-heading">{heading}</h3>
        <Container className="custom-form-section">
          <Container className="image-upload">
            <Col>
              <Container className={`image-display-area-${classType}`}>
                {selectedImage ? (
                  <AvatarEditor
                    ref={editorRef}
                    image={selectedImage}
                    width={classType === "user" ? 200 : 300}
                    height={200}
                    borderRadius={classType === "user" ? 100 : 50}
                    scale={scale}
                    color={[255, 255, 255, 0.5]}
                    className="editor"
                  />
                ) : (
                  <span>+ Click button to your right to upload an image</span>
                )}
              </Container>

              {editMode && (
                <Container className="edit-area">
                  <span>Adjust your image by moving the slider</span>
                  <Form.Range
                    className="custom-slider"
                    value={scale}
                    min="0.5"
                    max="2"
                    step="0.1"
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                  />
                  <Container className="button-container">
                    <Button
                      variant="secondary"
                      className="check-button"
                      onClick={handleSave}
                    >
                      <FaCheck />
                    </Button>
                    <Button variant="secondary" onClick={handleDiscardChanges}>
                      <FaTrash />
                    </Button>
                  </Container>
                </Container>
              )}
            </Col>
            <Col>
              <Row>
                <Container className="image-upload-info">
                  {uploadInfo}
                </Container>
              </Row>
              <Row>
                <Container className="button-container">
                  {selectedImage ? (
                    <Container>
                      <Button
                        variant="secondary"
                        className="edit-button"
                        onClick={handleEdit}
                      >
                        <FaEdit /> Edit image
                      </Button>
                      <Button
                        variant="secondary"
                        className="upload-button"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FaUpload /> Upload image
                      </Button>
                    </Container>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <FaUpload /> Upload image
                    </Button>
                  )}
                </Container>
              </Row>
              <Row>
                {selectedImage && (
                  // <Container className="trash-icon-container">
                  //   <FaTrash
                  //     className="trash-icon"
                  //     onClick={handleDeleteClick}
                  //   />
                  //   <span>Delete image</span>
                  // </Container>
                  <Container className="trash-icon-container">
                    <Button
                      variant="outline-danger"
                      type="button"
                      onClick={handleDeleteClick}
                      className="delete-button"
                    >
                      <FaTrash style={{ marginRight: "5px" }} />
                      Delete image
                    </Button>
                  </Container>
                )}
              </Row>
            </Col>

            <Form.Control
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </Container>
        </Container>
        <ErrorModal
          showError={showError}
          errorMessage={errorMessage}
          handleCloseErrorModal={handleCloseErrorModal}
        ></ErrorModal>
      </Container>

      <Modal show={showDeleteConfirmation} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          "Are you sure you want to delete your profile image?"
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
