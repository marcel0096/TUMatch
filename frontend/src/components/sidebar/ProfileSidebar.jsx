import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Card } from "react-bootstrap";
import "./Sidebar.css";
import {
  FaUserCircle,
  FaEdit,
  FaUniversity,
  FaLinkedin,
  FaExternalLinkAlt,
  FaEnvelope,
  FaBirthdayCake,
} from "react-icons/fa";
import { getSkillNamesFromIds } from "../../utils";

export default function ProfileSidebar({ user, isOwnProfile }) {
  const navigate = useNavigate();
  const [skillNames, setSkillNames] = useState([]);

  useEffect(() => {
    const fetchSkillNames = async () => {
      try {
        const skillNamesFromIds = await getSkillNamesFromIds(user.skills);
        setSkillNames(skillNamesFromIds);
      } catch (error) {
        console.error("Failed to fetch skill names", error);
      }
    };
    fetchSkillNames();
  }, [user]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleContact = () => {
    navigate("/chat?newChat=" + user._id);
  };

  const handleNavigateToEdit = () => {
    navigate("/edit-profile");
  };

  return (
    <Card className="sidebar-card" style={{ marginBottom: "10px" }}>
      <Card.Body>
        {isOwnProfile && (
          <Row className="justify-content-end align-content-center">
            <Col
              md={12}
              className="justify-content-center align-content-center"
            >
              <Button
                variant="outline-secondary"
                onClick={handleNavigateToEdit}
                style={{ float: "right" }}
              >
                <FaEdit className="mx-1" />
                Edit Profile
              </Button>
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            {user.profilePicture ? (
              <img
                src={user.profilePicture.imageUrl}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                alt="Profile picture"
                className="profile-picture"
              />
            ) : (
              <FaUserCircle
                style={{
                  width: "150px",
                  height: "150px",
                }}
              ></FaUserCircle>
            )}
          </Col>
        </Row>

        <Row>
          <h2>
            {user.firstName && user.lastName
              ? user.firstName + " " + user.lastName
              : "-"}
          </h2>
        </Row>

        <Row className="justify-content-center align-content-center">
          {skillNames.map((skill, index) => (
            <Col
              md={6}
              lg={4}
              key={skill.label || index}
              className="justify-content-center align-content-center"
            >
              <div className="sidebar-badge">{skill.label}</div>
            </Col>
          ))}
        </Row>

        <div className="sidebar-title">
          <FaUserCircle style={{ marginRight: "5px" }} />
          About me
        </div>
        <div className="sidebar-text">
          {user.selfDescription ? user.selfDescription : "-"}
        </div>

        {user.studyPrograms && user.studyPrograms.length > 0 && (
          <>
            <div className="sidebar-title">
              <FaUniversity style={{ marginRight: "5px" }} />
              Study program
            </div>
            <div className="sidebar-text">
              {user.studyPrograms[0].program.value}
            </div>
          </>
        )}

        <div className="sidebar-title">
          <FaBirthdayCake style={{ marginRight: "5px" }} />
          Age
        </div>
        <div className="sidebar-text">
          {user.dateOfBirth ? calculateAge(user.dateOfBirth) + " years" : "-"}
        </div>

        <div className="sidebar-title">
          {" "}
          <FaEnvelope style={{ marginRight: "5px" }} />
          E-mail address
        </div>
        <div className="sidebar-text">{user.email}</div>

        <div className="sidebar-title">
          <FaLinkedin style={{ marginRight: "5px" }} /> LinkedIn
        </div>
        <div className="sidebar-text">
          {user.linkedinURL ? (
            <a
              className="sidebar-text"
              href={
                user.linkedinURL != null && user.linkedinURL.startsWith("http")
                  ? user.linkedinURL
                  : `https://${user.linkedinURL}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--bs-primary)" }}
            >
              Visit my profile{" "}
              <FaExternalLinkAlt
                style={{ marginLeft: "5px", color: "var(--bs-primary)" }}
              />
            </a>
          ) : (
            <a className="sidebar-text">-</a>
          )}
        </div>

        {!isOwnProfile && (
          <Button variant="primary" onClick={handleContact}>
            Contact {user.firstName}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
