import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import "./EditStartupAndProfilePage.css";
import { useNavigate } from "react-router-dom";
import { fetchUserById, performLogout, getUserProfilePageEnums } from "./api";
import { formatDate, getAllSkillNames, getSkillNamesFromIds } from "../utils";
import { useAuth } from "../AuthContext";
import ImageUploader from "./ImageUploader";
import FormEditor from "./FormEditor";
import LoadingScreen from "../LoadingScreen";
import ErrorModal from "./ErrorModal";

export default function EditProfilePage() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [inputFields, setInputFields] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    selfDescription: "",
    linkedinURL: "",
    selectedSkills: [],
    profilePictureUrl: "",
    studyPrograms: [],
    jobPositions: [],
    extraCurricularPositions: [],
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [hasPictureChanged, setHasPictureChanged] = useState(false);
  const inputMaxChars = 200;
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [allSkillNames, setAllSkillNames] = useState([]);
  const [userSkillNames, setUserSkillNames] = useState([]);
  const [userData, setUserData] = useState({});
  const [firstEffectFinished, setFirstEffectFinished] = useState(false);
  const [programOptions, setProgramOptions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        setUserData(userData);
        setLoading(true);
        const enums = await getUserProfilePageEnums();
        const options = [
          { label: "Please select", value: "" },
          ...Object.values(enums.Programs).map((value) => ({
            label: value,
            value,
          })),
        ];
        setProgramOptions(options);

        const allSkillNames = await getAllSkillNames(); // get all available skills
        setAllSkillNames(allSkillNames);
        const userSkillNames = await getSkillNamesFromIds(userData.skills);
        setUserSkillNames(userSkillNames);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData().then(() => setFirstEffectFinished(true));
  }, [userId, navigate]);

  useEffect(() => {
    const fillSkillNames = async () => {
      setInputFields({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        dateOfBirth: formatDate(userData.dateOfBirth) || "",
        selfDescription: userData.selfDescription || "",
        linkedinURL: userData.linkedinURL || "",
        selectedSkills: userSkillNames,
        studyPrograms:
          userData.studyPrograms.map((study) => ({
            ...study,
            startDate: formatDate(study.startDate),
            endDate: formatDate(study.endDate),
          })) || [],
        jobPositions:
          userData.jobPositions.map((job) => ({
            ...job,
            startDate: formatDate(job.startDate),
            endDate: formatDate(job.endDate),
          })) || [],
        extraCurricularPositions:
          userData.extraCurricularPositions.map((position) => ({
            ...position,
            startDate: formatDate(position.startDate),
            endDate: formatDate(position.endDate),
          })) || [],
      });
      if (userData.profilePicture) {
        setProfilePictureUrl(userData.profilePicture.imageUrl || "");
      }
    };
    if (firstEffectFinished) {
      fillSkillNames();
    }
  }, [firstEffectFinished]);

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

  const handleAddSection = (sectionName) => {
    if (sectionName === "studyPrograms") {
      setInputFields((prevFields) => ({
        ...prevFields,
        studyPrograms: [...prevFields.studyPrograms, {}],
      }));
    } else if (sectionName === "jobPositions") {
      setInputFields((prevFields) => ({
        ...prevFields,
        jobPositions: [...prevFields.jobPositions, {}],
      }));
    } else {
      setInputFields((prevFields) => ({
        ...prevFields,
        extraCurricularPositions: [...prevFields.extraCurricularPositions, {}],
      }));
    }
  };

  const handleRemoveSection = (sectionName, index) => {
    if (sectionName === "studyPrograms") {
      setInputFields((prevFields) => ({
        ...prevFields,
        studyPrograms: prevFields.studyPrograms.filter((_, i) => i !== index),
      }));
    } else if (sectionName === "jobPositions") {
      setInputFields((prevFields) => ({
        ...prevFields,
        jobPositions: prevFields.jobPositions.filter((_, i) => i !== index),
      }));
    } else {
      setInputFields((prevFields) => ({
        ...prevFields,
        extraCurricularPositions: prevFields.extraCurricularPositions.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("CLOSEST: ", e);
    const form = e.currentTarget.closest("form");
    console.log(form);
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
        formData.append("dateOfBirth", inputFields.dateOfBirth);
        formData.append("selfDescription", inputFields.selfDescription);
        formData.append("linkedinURL", inputFields.linkedinURL);
        formData.append(
          "studyPrograms",
          JSON.stringify(inputFields.studyPrograms)
        );
        formData.append(
          "jobPositions",
          JSON.stringify(inputFields.jobPositions)
        );
        formData.append(
          "extraCurricularPositions",
          JSON.stringify(inputFields.extraCurricularPositions)
        );
        formData.append("skills", JSON.stringify(inputFields.selectedSkills));
        if (hasPictureChanged) {
          formData.append("profilePictureUrl", profilePictureUrl);
        }

        const response = await fetch(
          "http://localhost:8080/users/addUserInfo",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
        if (response.ok) {
          navigate("/user");
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
    navigate("/user");
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
        const loggedOut = await performLogout();
        if (loggedOut) {
          logout(); // logout in local state -> set flag to false and user to null
          navigate("/user-deleted");
        }
      } else {
        const text = await response.text();
        console.error("Unable to delete startup: ", text);
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
          label: "Date of birth",
          name: "dateOfBirth",
          type: "date",
          onChange: (value) =>
            setInputFields({ ...inputFields, dateOfBirth: value }),
        },
        {
          label: "Short self description",
          name: "selfDescription",
          type: "textarea",
          rows: 3,
          placeholder: "Enter short description",
          requiresValidation: true,
          validate: false,
          showCharCount: true,

          onChange: (value) =>
            setInputFields({ ...inputFields, selfDescription: value }),
        },
        {
          label: "LinkedIn URL",
          name: "linkedinURL",
          type: "text",
          placeholder: "Enter URL",
          onChange: (value) =>
            setInputFields({ ...inputFields, linkedinURL: value }),
        },
        {
          label: "Your Skills",
          name: "selectedSkills",
          type: "select",
          isMulti: true,
          isCreatable: true,
          options: allSkillNames,
          onChange: (value) =>
            setInputFields({ ...inputFields, selectedSkills: value }),
        },
      ],
    },
  ];

  const expandingSections = [
    {
      name: "studyPrograms",
      label: "study programs",
      heading: "Study details",
      items: inputFields.studyPrograms,
      fields: [
        {
          label: "University",
          name: "university",
          type: "text",
          placeholder: "Enter university",
          required: true,
        },
        {
          label: "Level of study program (Bachelor/Master)",
          name: "level",
          type: "select",
          options: [
            { label: "Please select", value: "" },
            { label: "Bachelor", value: "Bachelor" },
            { label: "Master", value: "Master" },
          ],
          required: true,
        },
        {
          label: "Study program",
          name: "program",
          type: "select",
          options: programOptions,
          required: true,
        },
        {
          label: "Start date",
          name: "startDate",
          type: "date",
          required: true,
        },
        {
          label: "End date (if ongoing, please leave empty)",
          name: "endDate",
          type: "date",
          required: true,
        },
      ],
    },
    {
      name: "jobPositions",
      label: "job positions",
      heading: "Professional experience",
      items: inputFields.jobPositions,
      fields: [
        {
          label: "Company",
          name: "company",
          type: "text",
          placeholder: "Enter company",
          required: true,
        },
        {
          label: "Job title",
          name: "title",
          type: "text",
          placeholder: "Enter job title",
          required: true,
        },
        {
          label: "Description",
          name: "description",
          type: "textarea",
          rows: 3,
          placeholder: "Enter job description",
          required: true,
          requiresValidation: true,
          showCharCount: true,
        },
        {
          label: "Start date",
          name: "startDate",
          type: "date",
          required: true,
        },
        {
          label: "End date (if ongoing, please leave empty)",
          name: "endDate",
          type: "date",
          required: true,
        },
      ],
    },
    {
      name: "extraCurricularPositions",
      label: "extra curricular positions",
      heading: "Extra Curricular experience",
      items: inputFields.extraCurricularPositions,
      fields: [
        {
          label: "Organization",
          name: "organization",
          type: "text",
          placeholder: "Enter organization",
          required: true,
        },
        {
          label: "Position",
          name: "position",
          type: "text",
          placeholder: "Enter position you worked in",
          required: true,
        },
        {
          label: "Description",
          name: "description",
          type: "textarea",
          rows: 3,
          placeholder: "Enter description of your work",
          required: true,
          requiresValidation: true,
          showCharCount: true,
        },
        {
          label: "Start date",
          name: "startDate",
          type: "date",
          required: true,
        },
        {
          label: "End date (if ongoing, please leave empty)",
          name: "endDate",
          type: "date",
          required: true,
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
          expandingSections={expandingSections}
          handleSubmit={handleSubmit}
          handleDiscardChanges={handleDiscardChanges}
          handleAddSection={handleAddSection}
          handleRemoveSection={handleRemoveSection}
          handleInputChange={handleInputChange}
          getInputLength={inputFields.jobPositions}
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
