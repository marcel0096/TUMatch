import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Card } from "react-bootstrap";
import "./Sidebar.css";
import {
  FaBuilding,
  FaBusinessTime,
  FaGlobe,
  FaEdit,
  FaExternalLinkAlt,
  FaHandHoldingUsd,
  FaIndustry,
  FaMoneyBillWave,
} from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function StartupSidebar({ startup, isCoFounder, isStudent }) {
  const navigate = useNavigate();
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  console.log("business model", startup.businessModel.value);
  const handleContactTeam = () => {
    if (isCoFounder) {
      alert("CoFounders cannot contact team");
    } else {
      navigate("/chat?newChat=" + startup.coFounders[0]);
    }
  };

  const handleNavigateToEdit = () => {
    navigate("/edit-startup");
  };

  const handleNavigateToManageEmployees = () => {
    navigate("/manage-cofounders");
  };

  const handleCopy = () => {
    console.log("copied " + window.location.href);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  return (
    <Card className="sidebar-card" style={{ marginBottom: "10px" }}>
      <Card.Body>
        {isCoFounder && (
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
                Edit Startup
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleNavigateToManageEmployees}
                style={{ float: "center", margin: "0.4rem" }}
              >
                <FaEdit className="mx-1" />
                Manage co-founders
              </Button>
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            {startup.startupLogo ? (
              <img
                src={startup.startupLogo.imageUrl}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "3%",
                  objectFit: "cover",
                }}
                alt="Startup Logo"
                className="startup-logo"
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
          <Col
            md={6}
            lg={4}
            lassName="justify-content-center align-content-center"
          >
            <div className="sidebar-badge">{startup.industry.label}</div>
          </Col>
          <Col
            md={6}
            lg={4}
            className="justify-content-center align-content-center"
          >
            <div className="sidebar-badge">{startup.businessModel.label}</div>
          </Col>
          <Col
            md={6}
            lg={4}
            className="justify-content-center align-content-center"
          >
            <div className="sidebar-badge">{startup.investmentStage.label}</div>
          </Col>
        </Row>

        <div className="sidebar-title">
          {" "}
          <FaBuilding style={{ marginRight: "5px" }} />
          Company Name
        </div>
        <div className="sidebar-text">{startup.startupName}</div>

        <div className="sidebar-title">
          <FaIndustry style={{ marginRight: "5px" }} />
          Industry
        </div>
        <div className="sidebar-text">
          {startup.industry ? startup.industry.label : "-"}
        </div>

        <div className="sidebar-title">
          {" "}
          <FaBusinessTime style={{ marginRight: "5px" }} />
          Business Model
        </div>
        <div className="sidebar-text">
          {startup.businessModel ? startup.businessModel.label : "-"}
        </div>

        <div className="sidebar-title">
          <FaHandHoldingUsd style={{ marginRight: "5px" }} />
          Investment Stage
        </div>
        <div className="sidebar-text">
          {startup.investmentStage ? startup.investmentStage.label : "-"}
        </div>

        <div className="sidebar-title">
          <FaMoneyBillWave style={{ marginRight: "5px" }} />
          Required Resources
        </div>
        <div className="sidebar-text">
          {startup.requiredResources ? startup.requiredResources : "-"}
        </div>

        <div className="sidebar-title">
          {" "}
          <FaGlobe style={{ marginRight: "5px" }} />
          Website
        </div>
        <div className="sidebar-text">
          <a
            className="sidebar-text"
            href={
              startup.websiteURL != null &&
              startup.websiteURL.startsWith("http")
                ? startup.websiteURL
                : `http://${startup.websiteURL}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bs-primary)" }}
          >
            {startup.websiteURL ? (
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

        {!isCoFounder ? (
          <Button variant="primary" onClick={handleContactTeam}>
            Contact Team
          </Button>
        ) : (
          <>
            <CopyToClipboard text={window.location.href} onCopy={handleCopy}>
              {showCopiedAlert ? (
                <Button disabled="true" variant="success">
                  Link copied to clipboard!
                </Button>
              ) : (
                <Button variant="primary">Share Startup</Button>
              )}
            </CopyToClipboard>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
