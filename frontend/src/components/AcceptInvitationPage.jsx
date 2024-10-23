import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";
import { validateInvitation, answerInvitation } from "./api";
import { useAuth } from "../AuthContext";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import LoadingScreen from "../LoadingScreen";
import ErrorModal from "./ErrorModal";
import "./DetailPage.css";

export default function AcceptInvitationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [institutionName, setInstitutionName] = useState("");
  const [companyImage, setCompanyImage] = useState("");
  const [hasCompanyImage, setHasCompanyImage] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const companyCode = searchParams.get("companyCode");
  const startupCode = searchParams.get("startupCode");
  const isCompanyCode = companyCode !== null;
  const institutionType = isCompanyCode
    ? "investment-institutions"
    : "startups";
  const code = companyCode || startupCode;
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await validateInvitation(code, institutionType);
        setInstitutionName(response.company_name);
        setCompanyImage(response.company_image);
        setHasCompanyImage(response.company_has_logo);
        console.log("alsdkfj", response.company_image);
        if (!isLoggedIn) {
          navigate("/login", { state: { from: location } });
          return;
        }
      } catch (error) {
        setInstitutionName("");
        setCompanyImage("");
        console.error("Error validating invitation code:", error);
        alert(
          "An error occurred while validating the invitation code. Maybe the code is invalid?"
        );
        navigate("/my-profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, userId, startupCode, companyCode, navigate]);

  const handleAccept = async () => {
    try {
      const companyID = await answerInvitation(
        code,
        institutionType,
        userId,
        true
      );
      if (isCompanyCode) {
        navigate(`/investment-institution?id=${companyID}`);
      } else {
        navigate(`/startup?id=${companyID}`);
      }
    } catch (error) {
      console.error("Error answering invitation:", error);
      setShowError(true);
      console.log(error);
      const localErrorMessage = isCompanyCode
        ? "Cannot add user to investment institution! Either maximum employee number is reached or user is already in the investment institution!"
        : "Cannot add user to startup! User is already in the startup, or user already has own startup!";
      setErrorMessage(localErrorMessage);
    }
  };

  const handleDecline = async () => {
    try {
      const companyID = await answerInvitation(
        code,
        institutionType,
        userId,
        false
      );
      navigate("/startup-overview");
    } catch (error) {
      console.error("Error answering invitation:", error);
      alert(
        "An error occurred while declining the invitation. Please try again later."
      );
      navigate("/");
    }
  };

  const handleCloseErrorModal = () => {
    setShowError(false);
    setErrorMessage("");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
      <div className="text-center descriptionText">
        {hasCompanyImage ? (
          <img
            src={companyImage.imageUrl}
            alt="Company Logo"
            className="img-fluid"
          />
        ) : (
          <FaBuilding
            style={{ width: "150px", height: "150px", paddingBottom: "20px" }}
          />
        )}
        <p>
          You have been invited to join the{" "}
          {isCompanyCode ? "Company" : "Startup"} : <b>{institutionName}</b>
        </p>
        <div>
          <Button variant="success" onClick={handleAccept}>
            Accept Invitation
          </Button>{" "}
          <Button variant="danger" onClick={handleDecline}>
            Decline Invitation
          </Button>
        </div>
      </div>
      <ErrorModal
        showError={showError}
        errorMessage={errorMessage}
        handleCloseErrorModal={handleCloseErrorModal}
      ></ErrorModal>
    </div>
  );
}
