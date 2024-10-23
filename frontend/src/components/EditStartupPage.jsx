import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import "./EditStartupAndProfilePage.css";
import {
  fetchStartupByUserId,
  getNewInvitationCode,
  fetchUserById,
  getStartupEnums,
} from "./api";
import { getAllSkillNames, getSkillNamesFromIds } from "../utils";
import { useAuth } from "../AuthContext";
import ImageUploader from "./ImageUploader";
import FormEditor from "./FormEditor";
import LoadingScreen from "../LoadingScreen";
import ErrorModal from "./ErrorModal";

export default function EditStartupPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [inputFields, setInputFields] = useState({
    startupName: "",
    industry: "",
    businessModel: "",
    investmentStage: "",
    requiredResources: "",
    websiteURL: "",
    coFounders: [],
    slogan: "",
    shortDescription: "",
    longDescription: "",
    jobOffers: [],
    startupLogoUrl: "",
  });
  const [startupId, setStartupId] = useState(null);
  const [startupLogoUrl, setStartupLogoUrl] = useState("");
  const [hasLogoChanged, setHasLogoChanged] = useState(false);
  const inputMaxChars = 200;
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitationLink, setInvitationLink] = useState("");
  const invitationLinkPre = "http://localhost:3000/invite?startupCode=";
  const [coFounders, setCoFounders] = useState([]);
  const [coFounderDetails, setCoFounderDetails] = useState([]);
  const [validated, setValidated] = useState(false);
  const [allSkillNames, setAllSkillNames] = useState([]);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [businessModelOptions, setBusinessModelOptions] = useState([]);
  const [investmentStageOptions, setInvestmentStageOptions] = useState([]);

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        let startup = null;
        try {
          setLoading(true);
          startup = await fetchStartupByUserId(userId);
          setStartupId(startup._id);
          setCoFounders(startup.coFounders);
          if (startup.startupLogo) {
            setStartupLogoUrl(startup.startupLogo.imageUrl || "");
          }
          setInvitationLink(
            invitationLinkPre + startup.invitationCode[0] || ""
          );
          for (let i = 0; i < startup.jobOffers.length; i++) {
            const skills = await getSkillNamesFromIds(
              startup.jobOffers[i].requiredSkills
            ); // get skill names from skill id list for each job offer
            startup.jobOffers[i].requiredSkills = skills; // replace skill ids with skill names
          }
          setInputFields({
            startupName: startup.startupName || "",
            industry: startup.industry || "",
            businessModel: startup.businessModel || "",
            investmentStage: startup.investmentStage || "",
            requiredResources: startup.requiredResources || "",
            websiteURL: startup.websiteURL || "",
            coFounders: startup.coFounders || [],
            slogan: startup.slogan || "",
            shortDescription: startup.shortDescription || "",
            longDescription: startup.longDescription || "",
            jobOffers: startup.jobOffers || [],
          });
        } catch (error) {
          // case: user has no startup yet
          console.info(
            "Error fetching startup data (probably because it does not exist yet):",
            error
          );
          setCoFounders([userId]); // user is automatically a co-founder of their own startup

          // Provide default values for setInputFields in case of error
          setInputFields({
            startupName: "",
            industry: "",
            businessModel: "",
            investmentStage: "",
            requiredResources: "",
            websiteURL: "",
            coFounders: [userId], // Include the user as a co-founder by default
            slogan: "",
            shortDescription: "",
            longDescription: "",
            jobOffers: [],
          });
        }
        const enums = await getStartupEnums();
        const indOptions = [
          ...Object.values(enums.Industry).map((value) => ({
            label: value,
            value,
          })),
        ];
        setIndustryOptions(indOptions);

        const bModelOptions = [
          ...Object.values(enums.BusinessModel).map((value) => ({
            label: value,
            value,
          })),
        ];
        setBusinessModelOptions(bModelOptions);
        const iStageOptions = [
          ...Object.values(enums.InvestmentStage).map((value) => ({
            label: value,
            value,
          })),
        ];
        setInvestmentStageOptions(iStageOptions);
        const allSkillNames = await getAllSkillNames(); // get all available skills
        setAllSkillNames(allSkillNames);
      } catch (error) {
        console.error("Error fetching startup data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartupData();
  }, [userId, navigate]);

  useEffect(() => {
    async function fetchCoFounderDetails() {
      const userDetails = await Promise.all(
        coFounders.map(async (userId) => {
          const user = await fetchUserById(userId);
          let userProfilePicture;
          if (user.profilePicture && user.profilePicture.data) {
            userProfilePicture = user.profilePicture.imageUrl;
          } else {
            userProfilePicture = null;
          }
          return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profession: user.profession,
            profilePicture: userProfilePicture,
          };
        })
      );
      setCoFounderDetails(userDetails);
    }
    if (coFounders && coFounders.length > 0) {
      fetchCoFounderDetails();
    }
  }, [coFounders]);

  const fetchData = async () => await fetchStartupByUserId(userId);

  const handleImageSave = (imageUrl) => {
    setStartupLogoUrl(imageUrl);
    setHasLogoChanged(true);
  };

  const imageUrlExtractor = (data) => {
    if (data.startupLogo && data.startupLogo.imageUrl) {
      return data.startupLogo.imageUrl;
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

    setInputFields((prevState) => {
      const updatedSection = prevState[sectionName].map((item, index) =>
        index === itemIndex ? { ...item, [name]: value } : item
      );

      // Only update state if value has changed
      if (
        JSON.stringify(prevState[sectionName]) !==
        JSON.stringify(updatedSection)
      ) {
        return {
          ...prevState,
          [sectionName]: updatedSection,
        };
      }

      return prevState;
    });
  };

  const handleAddSection = (sectionName) => {
    if (sectionName === "jobOffers") {
      setInputFields((prevFields) => ({
        ...prevFields,
        jobOffers: [...prevFields.jobOffers, {}],
      }));
    }
  };

  const handleRemoveSection = (sectionName, index) => {
    if (sectionName === "jobOffers") {
      setInputFields((prevFields) => ({
        ...prevFields,
        jobOffers: prevFields.jobOffers.filter((_, i) => i !== index),
      }));
    }
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
        if (startupId) {
          formData.append("_id", startupId);
        }

        formData.append("startupName", inputFields.startupName);
        formData.append("industry", JSON.stringify(inputFields.industry));
        formData.append(
          "businessModel",
          JSON.stringify(inputFields.businessModel)
        );
        formData.append(
          "investmentStage",
          JSON.stringify(inputFields.investmentStage)
        );
        formData.append("requiredResources", inputFields.requiredResources);
        formData.append("websiteURL", inputFields.websiteURL);
        formData.append("shortDescription", inputFields.shortDescription);
        formData.append("longDescription", inputFields.longDescription);
        formData.append("jobOffers", JSON.stringify(inputFields.jobOffers));
        formData.append("slogan", inputFields.slogan);
        formData.append("coFounders", JSON.stringify(coFounders));
        if (hasLogoChanged) {
          formData.append("startupLogo", startupLogoUrl);
        }

        const response = await fetch(
          "http://localhost:8080/startups/addStartupInfo",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
        if (response.ok) {
          let data = await response.json();
          navigate("/startup?id=" + data._id);
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
    if (startupId) {
      navigate("/startup?id=" + startupId);
    } else {
      navigate("/");
    }
  };

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  async function deleteStartup() {
    try {
      const response = await fetch(
        `http://localhost:8080/startups/delete/${startupId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        const text = await response.text();
        console.error("Unable to delete startup: ", text);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  const handleRemoveCofounder = (index) => {
    const newCofounders = [...coFounders];
    newCofounders.splice(index, 1);
    setCoFounders(newCofounders);
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      alert("Invitation link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const createNewInvitationLink = async () => {
    try {
      let data = await getNewInvitationCode(startupId, "startups");
      setInvitationLink(invitationLinkPre + data.code);
    } catch (error) {
      console.error("Error fetching new invitation code:", error);
    }
  };

  const normalSections = [
    {
      heading: "General Information",
      fields: [
        {
          label: "Startup Name",
          name: "startupName",
          type: "text",
          placeholder: "Enter startup name",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, startupName: value }),
        },
        {
          label: "Industry",
          name: "industry",
          type: "select",
          options: industryOptions,
          placeholder: "Select industry",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, industry: value }),
        },
        {
          label: "Business Model",
          name: "businessModel",
          type: "select",
          placeholder: "Select business model",
          required: true,
          options: businessModelOptions,
          onChange: (value) =>
            setInputFields({ ...inputFields, businessModel: value }),
        },
        {
          label: "Investment Stage",
          name: "investmentStage",
          type: "select",
          placeholder: "Enter investment stage (e.g., Pre-Seed, Series-A, ...)",
          options: investmentStageOptions,
          onChange: (value) =>
            setInputFields({ ...inputFields, investmentStage: value }),
        },
        {
          label: "Required Resources",
          name: "requiredResources",
          type: "text",
          placeholder: "Enter required resources",
          onChange: (value) =>
            setInputFields({ ...inputFields, requiredResources: value }),
        },
        {
          label: "Website URL",
          name: "websiteURL",
          type: "text",
          placeholder: "Enter website URL",
          onChange: (value) =>
            setInputFields({ ...inputFields, websiteURL: value }),
        },
      ],
    },
    {
      heading: "Detailed Startup Information",
      fields: [
        {
          label: "Slogan",
          name: "slogan",
          type: "text",
          placeholder: "Enter slogan",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, slogan: value }),
        },
        {
          label: "Short Description",
          name: "shortDescription",
          type: "textarea",
          rows: 3,
          placeholder: "Enter short description",
          showCharCount: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, shortDescription: value }),
        },
        {
          label: "Long Description",
          name: "longDescription",
          type: "richtext-editor",
          placeholder:
            "Enter long description (Use the header to edit text in rich text format)",
          onChange: (value) =>
            setInputFields({ ...inputFields, longDescription: value }),
        },
      ],
    },
  ];

  const expandingSections = [
    {
      name: "jobOffers",
      label: "job offers",
      heading: "Job Offers",
      items: inputFields.jobOffers,
      fields: [
        {
          label: "Job title",
          name: "shortDescription",
          type: "textarea",
          rows: 3,
          showCharCount: true,
          placeholder: "Enter job title (e.g., Software Engineer)",
        },
        {
          label: "Long Description",
          name: "longDescription",
          type: "richtext-editor",
          showCharCount: true,
          placeholder:
            "Enter long description (Use the header to edit text in rich text format)",
        },
        {
          label: "Required Skills",
          name: "requiredSkills",
          type: "select",
          isMulti: true,
          isCreatble: true,
          options: allSkillNames,
          placeholder: "Enter required skills",
        },
      ],
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="edit-container">
      <h1 className="edit-container">
        {startupId == null
          ? "Create a profile for your startup!"
          : `Edit your startup ${inputFields.startupName}!`}
      </h1>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <ImageUploader
          fetchData={fetchData}
          handleImageSave={handleImageSave}
          imageUrlExtractor={imageUrlExtractor}
          initialImageUrl=""
          heading="Edit Startup Logo"
          uploadInfo="Upload the logo of your startup here! This increases your chances of getting a match!"
          classType="startup"
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
          getInputLength={inputFields.shortDescription.length}
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
