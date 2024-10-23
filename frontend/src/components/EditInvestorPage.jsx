import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import "./EditStartupAndProfilePage.css";
import { useNavigate } from "react-router-dom";
import { fetchUserById, performLogout } from "./api";
import { useAuth } from "../AuthContext";
import ImageUploader from "./ImageUploader";
import FormEditor from "./FormEditor";
import LoadingScreen from "../LoadingScreen";
import ErrorModal from "./ErrorModal";

export default function EditInvestorPage() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [inputFields, setInputFields] = useState({
    firstName: "",
    lastName: "",
    linkedinURL: "",
    position: "",
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [hasPictureChanged, setHasPictureChanged] = useState(false);
  const inputMaxChars = 200;
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [userData, setUserData] = useState({});
  const [firstEffectFinished, setFirstEffectFinished] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        setUserData(userData);
        setInputFields({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          linkedinURL: userData.linkedinURL || "",
          position: userData.position || "",
        });
        if (userData.profilePicture) {
          setProfilePictureUrl(userData.profilePicture.imageUrl || "");
        }
        setLoading(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const fetchData = async () => {
    return await fetchUserById(userId);
  };

  const handleImageSave = (imageUrl) => {
    setProfilePictureUrl(imageUrl);
    setHasPictureChanged(true);
  };

  const imageUrlExtractor = (data) => {
    if (data.profilePicture && data.profilePicture.imageUrl) {
      return data.profilePicture.imageUrl;
    }
    return "";
  };

  const handleInputChange = (
    sectionName,
    itemIndex,
    eventOrValue,
    fieldName
  ) => {
    //const { name, value } = event.target;

    let name, value;

    if (eventOrValue.target) {
      // For standard input events
      name = eventOrValue.target.name;
      value = eventOrValue.target.value;
    } else {
      // For react-select events
      name = fieldName;
      value = eventOrValue;
    }

    const updatedSection = inputFields[sectionName].map((item, index) =>
      index === itemIndex ? { ...item, [name]: value } : item
    );
    setInputFields((prevState) => ({
      ...prevState,
      [sectionName]: updatedSection,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowError(true);
      setErrorMessage("Please enter all fields correctly.");
    } else {
      try {
        const formData = new FormData();
        formData.append("_id", userId);
        formData.append("firstName", inputFields.firstName);
        formData.append("lastName", inputFields.lastName);
        formData.append("position", inputFields.position);
        formData.append("linkedinURL", inputFields.linkedinURL);
        if (hasPictureChanged) {
          formData.append("profilePictureUrl", profilePictureUrl);
        }
        formData.append("profession", "investor");

        const response = await fetch(
          "http://localhost:8080/users/addUserInfo",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
        if (response.ok) {
          navigate("/investment-institution");
        } else {
          const text = await response.text();
          setErrorMessage("Oops! Something went wrong. Please try again.");
          setShowError(true);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }

    setValidated(true);
  };

  const handleDiscardChanges = (e) => {
    e.preventDefault();
    navigate("/investment-institution");
  };

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  async function deleteUser() {
    try {
      const response = await fetch(
        `http://localhost:8080/users/delete/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        //TODO: muss hier auth nochmal neu geladen werden???
        navigate("/home");
      } else {
        const text = await response.text();
        console.error("Unable to delete user: ", text);
      }

      const loggedOut = await performLogout();
      if (loggedOut) {
        logout(); // logout in local state -> set flag to false and user to null
        navigate("/user-deleted");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  const normalSections = [
    {
      heading: "Personal details",
      fields: [
        {
          label: "First name",
          name: "firstName",
          type: "text",
          placeholder: "Enter first name",
          required: true,
          validate: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, firstName: value }),
        },
        {
          label: "Last name",
          name: "lastName",
          type: "text",
          placeholder: "Enter last name",
          required: true,
          validate: false,
          onChange: (value) =>
            setInputFields({ ...inputFields, lastName: value }),
        },
        {
          label: "Position",
          name: "position",
          type: "text",
          placeholder: "Enter position in your company",
          required: true,
          validate: false,
          onChange: (value) =>
            setInputFields({ ...inputFields, position: value }),
        },
        {
          label: "LinkedIn URL",
          name: "linkedinURL",
          type: "text",
          placeholder: "Enter LinkedIn URL",
          required: false,
          validate: false,
          onChange: (value) =>
            setInputFields({ ...inputFields, linkedinURL: value }),
        },
      ],
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="edit-container">
      <h1 className="edit-container">Edit your user profile!</h1>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <ImageUploader
          fetchData={fetchData}
          handleImageSave={handleImageSave}
          imageUrlExtractor={imageUrlExtractor}
          initialImageUrl=""
          heading="Edit Profile Picture"
          uploadInfo="Upload your profile picture here! This increases your chances of getting a match!"
          classType="user"
        />

        <FormEditor
          inputFields={inputFields}
          normalSections={normalSections}
          handleSubmit={handleSubmit}
          handleDiscardChanges={handleDiscardChanges}
          handleInputChange={handleInputChange}
        ></FormEditor>
        <ErrorModal
          showError={showError}
          errorMessage={errorMessage}
          handleCloseErrorModal={handleCloseErrorModal}
        ></ErrorModal>
      </Form>
    </Container>
  );
}
