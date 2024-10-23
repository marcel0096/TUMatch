import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import "./EditStartupAndProfilePage.css";
import {
  fetchCompanyByEmployeeId,
  fetchUserById,
  getNewInvitationCode,
} from "./api";
import { useAuth } from "../AuthContext";
import ImageUploader from "./ImageUploader";
import LoadingScreen from "../LoadingScreen";
import FormEditor from "./FormEditor";
import { investorOptions, industryOptions } from "./data/enumData.js";
import ErrorModal from "./ErrorModal";

export default function EditInvestmentInstitutionPage() {
  const { userId, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [investmentInstitutionId, setInvestmentInstitutionId] = useState(null);

  const [paid, setPaid] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const invitationLinkPre = "http://localhost:3000/invite?companyCode=";
  const [loading, setLoading] = useState(true);

  const [inputFields, setInputFields] = useState({
    investmentInstitutionName: "",
    industries: [],
    rangeOfInvestment: "",
    investorType: "",
    websiteURL: "",
    slogan: "",
    description: "",
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputMaxChars = 500;
  const [companyLogoUrl, setCompanyLogoUrl] = useState(""); // State to hold the raw file object which is sent to BE
  const [logoChanged, setLogoChanged] = useState(false); // Used to save whether the image was changed or not
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const fetchInvestmentInstitutionData = async () => {
      try {
        if (!isLoggedIn || !userId) {
          console.error("User is not logged in");
          navigate("/");
          return;
        }
        const investmentInstitution = await fetchCompanyByEmployeeId(userId);
        setLoading(true);

        setInvestmentInstitutionId(investmentInstitution._id || null);

        setInputFields({
          investmentInstitutionName: investmentInstitution.companyName || "",
          industries: investmentInstitution.industries || [],
          rangeOfInvestment: investmentInstitution.rangeOfInvestment || "",
          investorType: investmentInstitution.investorType || "",
          websiteURL: investmentInstitution.websiteURL || "",
          slogan: investmentInstitution.slogan || "",
          description: investmentInstitution.description || "",
        });

        if (investmentInstitution.companyLogo) {
          setCompanyLogoUrl(investmentInstitution.companyLogo.imageUrl || "");
        }

        setPaid(investmentInstitution.paid || false);
        setInvitationLink(
          invitationLinkPre + investmentInstitution.invitationCode[0] || ""
        );
        setEmployees(investmentInstitution.employees);
      } catch (error) {
        console.error(
          "Error fetching investment institution data (probably because it does not yet exist):",
          error
        );
        setEmployees([userId]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestmentInstitutionData();
  }, [isLoggedIn, userId, navigate]);

  useEffect(() => {
    async function fetchEmployeeDetails() {
      try {
        const userDetails = await Promise.all(
          employees.map(async (employeeId) => {
            const user = await fetchUserById(employeeId);
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
        setEmployeeDetails(userDetails);
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    }
    if (employees && employees.length > 0) {
      fetchEmployeeDetails();
    }
  }, [employees]);

  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget.closest("form");

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowError(true);
      setErrorMessage("Please enter all fields correctly.");
    } else {
      try {
        const formData = new FormData();
        if (investmentInstitutionId) {
          formData.append("_id", investmentInstitutionId);
        }
        formData.append("companyName", inputFields.investmentInstitutionName);
        formData.append("industries", JSON.stringify(inputFields.industries));
        formData.append(
          "investorType",
          JSON.stringify(inputFields.investorType)
        );
        formData.append("rangeOfInvestment", inputFields.rangeOfInvestment);
        formData.append("websiteURL", inputFields.websiteURL);
        formData.append("description", inputFields.description);
        formData.append("slogan", inputFields.slogan);
        formData.append("paid", paid);
        formData.append("employees", JSON.stringify(employees));
        if (logoChanged) {
          formData.append("companyLogo", companyLogoUrl); // Append the file object to form data
        }

        const response = await fetch(
          "http://localhost:8080/investment-institutions/addCompanyInfo",
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
          setErrorMessage("Oops, something went wrong. Please try again.");
          setShowError(true);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
    setValidated(true);
  }

  const handleCloseErrorModal = () => setShowError(false);

  const handleDiscardChanges = (e) => {
    e.preventDefault();
    navigate("/investment-institution");
  };

  const handleRemoveEmployee = (index) => {
    const newEmployees = [...employees];
    newEmployees.splice(index, 1);
    setEmployees(newEmployees);
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
      let data = await getNewInvitationCode(
        investmentInstitutionId,
        "investment-institutions"
      );
      setInvitationLink(invitationLinkPre + data.code);
    } catch (error) {
      console.error("Error fetching new invitation code:", error);
    }
  };

  async function deleteInvestmentInsitution() {
    try {
      const response = await fetch(
        `http://localhost:8080/investment-institutions/delete/${investmentInstitutionId}`,
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
        console.error("Unable to delete company: ", text);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  const fetchData = async () => await fetchCompanyByEmployeeId(userId);

  const handleImageSave = (imageUrl) => {
    setCompanyLogoUrl(imageUrl);
    setLogoChanged(true);
  };

  const imageUrlExtractor = (data) => {
    if (data.companyLogo && data.companyLogo.imageUrl) {
      return data.companyLogo.imageUrl;
    }
    return "";
  };

  if (loading) {
    <LoadingScreen />;
  }

  const normalSections = [
    {
      heading: "General Information",
      fields: [
        {
          label: "Investment Institution Name",
          name: "investmentInstitutionName",
          type: "text",
          placeholder: "Enter investment institution name",
          required: true,
          onChange: (value) =>
            setInputFields({
              ...inputFields,
              investmentInstitutionName: value,
            }),
        },
        {
          label: "Industries",
          name: "industries",
          type: "select",
          isMulti: true,
          options: industryOptions,
          placeholder: "Enter industries",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, industries: value }),
        },
        {
          label: "Investor Type",
          name: "investorType",
          type: "select",
          required: true,
          options: investorOptions,
          placeholder: "Enter investor type",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, investorType: value }),
        },
        {
          label: "Company slogan",
          name: "slogan",
          type: "text",
          placeholder: "Enter slogan",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, slogan: value }),
        },
        {
          label: "Short company description",
          name: "description",
          type: "textarea",
          rows: 3,
          placeholder: "Enter description",
          requiresValidation: true,
          showCharCount: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, description: value }),
        },
        {
          label: "Range of Investment",
          name: "rangeOfInvestment",
          type: "text",
          placeholder: "Enter range of investment",
          required: true,
          onChange: (value) =>
            setInputFields({ ...inputFields, rangeOfInvestment: value }),
        },
        {
          label: "Website",
          name: "websiteURL",
          type: "text",
          placeholder: "Enter website URL",
          onChange: (value) =>
            setInputFields({ ...inputFields, websiteURL: value }),
        },
      ],
    },
  ];

  return (
    <Container className="edit-container">
      <h1 className="edit-container">
        {investmentInstitutionId == null
          ? "Create a profile for your investment institution!"
          : `Edit your investment institution ${inputFields.investmentInstitutionName}!`}
      </h1>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <ImageUploader
          fetchData={fetchData}
          handleImageSave={handleImageSave}
          imageUrlExtractor={imageUrlExtractor}
          initialImageUrl=""
          heading="Edit Company Logo"
          uploadInfo="Upload the logo of your investment institution here! This increases your chances of getting a match!"
          classType="company"
        />

        <FormEditor
          inputFields={inputFields}
          normalSections={normalSections}
          expandingSections={null}
          handleSubmit={handleSubmit}
          handleDiscardChanges={handleDiscardChanges}
          handleAddSection={null}
          handleRemoveSection={null}
          handleInputChange={null}
          getInputLength={inputFields.description.length}
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
