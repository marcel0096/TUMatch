import { Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import {
  FaBuilding,
  FaGlobe,
  FaMoneyBillWave,
  FaIndustry,
  FaExternalLinkAlt,
  FaUserTie,
} from "react-icons/fa";
import "./Sidebar.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";

export default function InvestmentInstitutionSidebar({
  investmentInstitution,
  isEmployee,
}) {
  const navigate = useNavigate();
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const handleContactTeam = () => {
    if (isEmployee) {
      alert("Employees cannot contact team");
    } else {
      navigate("/chat?newChat=" + investmentInstitution.employees[0]);
    }
  };

  const handleNavigateToEdit = () => {
    navigate("/edit-investment-institution");
  };

  const handleNavigateToManageEmployees = () => {
    navigate("/manage-employees");
  };

  const handleCopy = () => {
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  return (
    <Card className="sidebar-card" style={{ marginBottom: "10px" }}>
      <Card.Body>
        {isEmployee && (
          <Row className="justify-content-end align-content-center">
            <Col
              md={12}
              className="justify-content-center align-content-center"
            >
              <Button
                variant="outline-secondary"
                onClick={handleNavigateToEdit}
                style={{ float: "center", margin: "0.4rem" }}
              >
                <FaEdit className="mx-1" />
                Edit Company
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleNavigateToManageEmployees}
                style={{ float: "center", margin: "0.4rem" }}
              >
                <FaEdit className="mx-1" />
                Manage employees
              </Button>
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            {investmentInstitution.companyLogo ? (
              <img
                src={investmentInstitution.companyLogo.imageUrl}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "3%",
                  objectFit: "cover",
                }}
                alt="Company Logo"
                className="company-logo"
              />
            ) : (
              <FaBuilding
                style={{
                  width: "100%",
                  height: "auto",
                }}
              ></FaBuilding>
            )}
          </Col>
        </Row>

        <Row className="justify-content-center align-content-center">
          {investmentInstitution.industries &&
            investmentInstitution.industries.map((industry) => (
              <Col
                md={6}
                lg={4}
                className="justify-content-center align-content-center"
              >
                <div className="sidebar-badge">{industry.label}</div>
              </Col>
            ))}
        </Row>

        <div className="sidebar-title">
          <FaBuilding style={{ marginRight: "5px" }} />
          Company Name
        </div>
        <div className="sidebar-text">{investmentInstitution.companyName}</div>

        <div className="sidebar-title">
          <FaUserTie style={{ marginRight: "5px" }} />
          Investor Type
        </div>
        <div className="sidebar-text">
          <div>
            {investmentInstitution.investorType &&
              investmentInstitution.investorType.value}
          </div>
        </div>

        <div className="sidebar-title">
          <FaMoneyBillWave style={{ marginRight: "5px" }} />
          Investment Size
        </div>
        <div className="sidebar-text">
          {investmentInstitution.rangeOfInvestment &&
            investmentInstitution.rangeOfInvestment}
        </div>

        <div className="sidebar-title">
          <FaIndustry style={{ marginRight: "5px" }} />
          Industries
        </div>
        <div className="sidebar-text">
          {investmentInstitution.industries &&
            investmentInstitution.industries.map((industry, index) => (
              <span key={index}>
                {industry.value}
                {investmentInstitution.industries.length - 1 !== index && ", "}
              </span>
            ))}
        </div>

        <div className="sidebar-title">
          <FaGlobe style={{ marginRight: "5px" }} />
          Website
        </div>
        <div className="sidebar-text">
          <a
            className="sidebar-text"
            href={
              investmentInstitution.websiteURL != null &&
              investmentInstitution.websiteURL.startsWith("http")
                ? investmentInstitution.websiteURL
                : `http://${investmentInstitution.websiteURL}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bs-primary)" }}
          >
            {investmentInstitution.websiteURL ? (
              <>
                Visit our website{" "}
                <FaExternalLinkAlt
                  style={{ marginLeft: "5px", color: "var(--bs-primary)" }}
                />
              </>
            ) : (
              "-"
            )}
          </a>
        </div>

        {!isEmployee ? (
          <Button variant="primary" onClick={handleContactTeam}>
            Contact Team
          </Button>
        ) : (
          <>
            <CopyToClipboard
              text={window.location.href + "?id=" + investmentInstitution._id}
              onCopy={handleCopy}
            >
              {showCopiedAlert ? (
                <Button disabled="true" variant="success">
                  Link copied to clipboard!
                </Button>
              ) : (
                <Button variant="primary">Share Investment Institution</Button>
              )}
            </CopyToClipboard>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
