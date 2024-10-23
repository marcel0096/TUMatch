import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./DetailPage.css";
import { getUser, fetchUserWithSortedInformationById } from "./api";
import ProfileSidebar from "./sidebar/ProfileSidebar";
import { formatDate } from "../utils";
import LoadingScreen from "../LoadingScreen";
import { FaBriefcase, FaHandHoldingHeart, FaUniversity } from "react-icons/fa";

export default function UserDetailPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [linkedinURL, setLinkedinURL] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selfDescription, setSelfDescription] = useState("");

  const [studyPrograms, setStudyPrograms] = useState([
    {
      university: "Technical University Munich (TUM)",
      level: "",
      program: "",
      startDate: "",
      endDate: "",
    },
  ]);

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [jobPositions, setJobPositions] = useState([
    { company: "", title: "", description: "", startDate: "", endDate: "" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser();
        setLoading(true);
        let userData;
        if (id !== null) {
          userData = await fetchUserWithSortedInformationById(id);
        } else {
          userData = await fetchUserWithSortedInformationById(user._id);
          if (userData.firstName === null) {
            navigate("/user/edit");
          }
        }
        setIsOwnProfile(user._id === userData._id);
        setUser(userData);

        setLinkedinURL(userData.linkedinURL || "");
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");

        // Ensure date is in YYYY-MM-DD format
        if (userData.dateOfBirth) {
          const formattedDate = formatDate(userData.dateOfBirth);
          setDateOfBirth(formattedDate);
        }
        setSelfDescription(userData.selfDescription || "");

        // Ensure date is in YYYY-MM-DD format
        if (userData.studyPrograms) {
          const formattedStudyPrograms = userData.studyPrograms.map(
            (study) => ({
              ...study,
              startDate: formatDate(study.startDate),
              endDate: formatDate(study.endDate),
            })
          );
          setStudyPrograms(formattedStudyPrograms);
        }

        // Ensure date is in YYYY-MM-DD format
        if (userData.jobPositions) {
          const formattedJobPositions = userData.jobPositions.map((job) => ({
            ...job,
            startDate: formatDate(job.startDate),
            endDate: formatDate(job.endDate),
          }));
          setJobPositions(formattedJobPositions);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="main-container" fluid style={{ paddingTop: "30px" }}>
      <Row style={{ flexWrap: "nowrap", marginBottom: 0 }}>
        <Col md={4} style={{ position: "sticky", top: 0 }}>
          <ProfileSidebar
            user={user != null ? user : null}
            isOwnProfile={isOwnProfile}
          ></ProfileSidebar>
        </Col>

        <Col
          md={8}
          style={{
            maxHeight: "100vh",
            overflowY: "auto",
          }}
        >
          <Row>
            <Card>
              <Card.Body>
                <Row
                  className="align-items-center"
                  style={{ textAlign: "left", paddingLeft: "0px" }}
                >
                  <h2
                    style={{
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaUniversity style={{ marginRight: "15px" }} />
                    Academic Background
                  </h2>
                </Row>
                <Row>
                  {user.studyPrograms && user.studyPrograms.length > 0 ? (
                    user.studyPrograms.map((study, index) => (
                      <ul className="list-unstyled timeline-sm">
                        <li className="timeline-sm-item">
                          <span
                            style={{ fontSize: "15px", textAlign: "right" }}
                            className="timeline-sm-date descriptionText"
                          >
                            Starting{" "}
                            <b>
                              {new Date(study.startDate).toLocaleDateString(
                                "en-GB"
                              )}
                            </b>{" "}
                            <br /> until{" "}
                            <b>
                              {study.endDate
                                ? new Date(study.endDate).toLocaleDateString(
                                    "en-GB"
                                  )
                                : "now"}
                            </b>
                          </span>
                          <h4
                            style={{ textAlign: "left" }}
                            className="mt-0 mb-1"
                          >
                            {study.university}
                          </h4>
                          <p
                            className="descriptionText"
                            style={{ textAlign: "left" }}
                          >
                            {study.program && study.program.value} -
                            {study.level && " " + study.level.value}
                          </p>
                        </li>
                      </ul>
                    ))
                  ) : (
                    <Container className="descriptionText">
                      No academic background yet.
                    </Container>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Row>

          <Row>
            <Card>
              <Card.Body>
                <Row
                  className="align-items-center"
                  style={{ textAlign: "left", paddingLeft: "0px" }}
                >
                  <h2
                    style={{
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaBriefcase style={{ marginRight: "15px" }} />
                    Professional Experience
                  </h2>
                </Row>
                <Row>
                  {user.jobPositions && user.jobPositions.length > 0 ? (
                    user.jobPositions.map((jobPosition, index) => (
                      <ul className="list-unstyled timeline-sm">
                        <li className="timeline-sm-item">
                          <span
                            style={{ fontSize: "15px", textAlign: "right" }}
                            className="timeline-sm-date descriptionText"
                          >
                            Starting{" "}
                            <b>
                              {new Date(
                                jobPosition.startDate
                              ).toLocaleDateString("en-GB")}
                            </b>{" "}
                            <br /> until{" "}
                            <b>
                              {jobPosition.endDate
                                ? new Date(
                                    jobPosition.endDate
                                  ).toLocaleDateString("en-GB")
                                : "now"}
                            </b>
                          </span>
                          <h4
                            style={{ textAlign: "left" }}
                            className="mt-0 mb-1"
                          >
                            {jobPosition.company}
                          </h4>
                          <p
                            className="descriptionText"
                            style={{ textAlign: "left" }}
                          >
                            {jobPosition.title}
                          </p>
                          <p style={{ textAlign: "left" }}>
                            {jobPosition.description}
                          </p>
                        </li>
                      </ul>
                    ))
                  ) : (
                    <Container className="descriptionText">
                      No professional experience yet.
                    </Container>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Row>

          <Row>
            <Card>
              <Card.Body>
                <Row
                  className="align-items-center"
                  style={{ textAlign: "left", paddingLeft: "0px" }}
                >
                  <h2
                    style={{
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaHandHoldingHeart style={{ marginRight: "15px" }} />
                    Extra Curricular Experience
                  </h2>
                </Row>
                <Row>
                  {user.extraCurricularPositions &&
                  user.extraCurricularPositions.length > 0 ? (
                    user.extraCurricularPositions.map(
                      (extraCurricularPosition, index) => (
                        <ul className="list-unstyled timeline-sm">
                          <li className="timeline-sm-item">
                            <span
                              style={{ fontSize: "15px", textAlign: "right" }}
                              className="timeline-sm-date descriptionText"
                            >
                              Starting{" "}
                              <b>
                                {new Date(
                                  extraCurricularPosition.startDate
                                ).toLocaleDateString("en-GB")}
                              </b>{" "}
                              <br /> until{" "}
                              <b>
                                {extraCurricularPosition.endDate
                                  ? new Date(
                                      extraCurricularPosition.endDate
                                    ).toLocaleDateString("en-GB")
                                  : "now"}
                              </b>
                            </span>
                            <h4
                              style={{ textAlign: "left" }}
                              className="mt-0 mb-1"
                            >
                              {extraCurricularPosition.organization}
                            </h4>
                            <p
                              className="descriptionText"
                              style={{ textAlign: "left" }}
                            >
                              {extraCurricularPosition.position}
                            </p>
                            <p style={{ textAlign: "left" }}>
                              {extraCurricularPosition.description}
                            </p>
                          </li>
                        </ul>
                      )
                    )
                  ) : (
                    <Container className="descriptionText">
                      No extra curricular experience yet.
                    </Container>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
