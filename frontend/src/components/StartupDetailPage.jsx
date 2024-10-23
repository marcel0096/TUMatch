import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "./DetailPage.css";
import { useAuth } from "../AuthContext";
import DOMPurify from "dompurify";

import {
  fetchStartupByUserId,
  getUser,
  fetchStartupByStartupId,
  fetchUserById,
} from "./api";
import StartupSidebar from "./sidebar/StartupSidebar"; // import the StartupSidebar component
import FounderInfoStudent from "./founderInfo/FounderInfoStudent";
import FounderInfoInvestor from "./founderInfo/FounderInfoInvestor";
import LoadingScreen from "../LoadingScreen";
import { getSkillNamesFromIds } from "../utils";

export default function StartupPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [startupId, setStartupId] = useState(null);
  const [startupName, setStartupName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [investmentStage, setInvestmentStage] = useState("");
  const [requiredResources, setRequiredResources] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [coFounders, setCoFounders] = useState("");
  const [slogan, setSlogan] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [jobOffers, setJobOffers] = useState([
    { shortDescription: "", longDescription: "", requiredSkills: [] },
  ]);
  const [jobOfferSkills, setJobOfferSkills] = useState([]);
  const [startup, setStartup] = useState("");
  const [founders, setFounders] = useState([]);
  const [isCofounder, setIsCofounder] = useState(false);

  const [isStudent, setIsStudent] = useState(false);
  const [isInvestor, setIsInvestor] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        let startup = null;

        let user = await getUser();
        let profession = user.profession;
        setLoading(true);

        //Routing on page load
        //Startup id in URL is set
        if (id !== null) {
          startup = await fetchStartupByStartupId(id);
          if (startup === null) {
            //Startup not found
            let userStartup = null;
            try {
              //check if user has a startup
              userStartup = await fetchStartupByUserId(userId);
            } catch (error) {
              console.error("no startup yet, getting error: ", error);
            }

            if (userStartup === null && profession === "student") {
              //User has no startup and is a student
              navigate("/edit-startup");
            } else {
              //User has a startup with different id or is an investor
              navigate("/");
            }
          }
        } else {
          //No startup id in URL
          navigate("/");
        }

        // Set the startup data
        setStartupId(startup._id || null);
        setStartupName(startup.startupName || "");
        setIndustry(startup.industry || "");
        setBusinessModel(startup.businessModel || "");
        setInvestmentStage(startup.investmentStage || "");
        setRequiredResources(startup.requiredResources || "");
        setWebsiteURL(startup.websiteURL || "");
        setCoFounders(startup.coFounders || "");
        setSlogan(startup.slogan || "");
        setShortDescription(startup.shortDescription || "");
        // for each job offer, get the skill names and add to jobOfferSkills
        const skills = []; // array of skills for each job offer
        for (let i = 0; i < startup.jobOffers.length; i++) {
          const skill = await getSkillNamesFromIds(
            startup.jobOffers[i].requiredSkills
          );
          skills.push(skill);
        }
        setJobOfferSkills(skills);

        setStartup(startup);

        //Sanitize long description

        // Function to configure DOMPurify to allow class names starting with 'ql'
        function configureDOMPurifyToAllowSpecificClasses() {
          DOMPurify.addHook("uponSanitizeElement", (node, data) => {
            if (data.attrName === "class") {
              // Split class names into an array
              const classes = data.attrValue.split(/\s+/);
              // Filter class names to only those starting with 'ql'
              const allowedClasses = classes.filter((className) =>
                className.startsWith("ql")
              );
              // Join the allowed classes back into a string and set it as the new class attribute value
              node.setAttribute("class", allowedClasses.join(" "));
            }
          });
        }
        configureDOMPurifyToAllowSpecificClasses();
        const longDescription = DOMPurify.sanitize(startup.longDescription);
        setLongDescription(longDescription);

        //Sanitize job offers
        if (startup.jobOffers) {
          const jobOffers = startup.jobOffers.map((jobOffer) => {
            return {
              shortDescription: DOMPurify.sanitize(jobOffer.shortDescription),
              longDescription: DOMPurify.sanitize(jobOffer.longDescription),
              requiredSkills: jobOffer.requiredSkills,
            };
          });
          setJobOffers(jobOffers);
        } else {
          setJobOffers([]);
        }

        // Fetch co-founders
        let foundersProfiles = [];
        for (let coFounderId of startup.coFounders) {
          if (coFounderId !== null && coFounderId !== "") {
            const coFounder = await fetchUserById(coFounderId);
            foundersProfiles.push(coFounder);
          }
        }
        setFounders(foundersProfiles);

        // Check if the current user is a co-founder
        for (let f of foundersProfiles) {
          if (f._id === userId) {
            setIsCofounder(true);
          }
        }

        // Check if the current user is a student or investor
        if (profession === "student") {
          setIsStudent(true);
          setIsInvestor(false);
        }
        if (profession === "investor") {
          setIsStudent(false);
          setIsInvestor(true);
        }
      } catch (error) {
        console.error("Error fetching startup data:", error);
        navigate("/");
      }
      setLoading(false);
    };

    fetchStartupData();
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="main-container" fluid style={{ paddingTop: "30px" }}>
      <Row
        style={{
          flexWrap: "nowrap",
          marginBottom: 0,
        }}
      >
        <Col md={4} style={{ position: "sticky", top: 0 }}>
          <StartupSidebar
            startup={startup}
            isCoFounder={isCofounder}
            isStudent={isStudent}
          ></StartupSidebar>
        </Col>

        <Col
          md={8}
          style={{
            maxHeight: "100vh",
            overflowY: "auto",
          }}
        >
          <Row className="justify-content-center align-content-center">
            {isStudent && (
              <FounderInfoStudent founders={founders}></FounderInfoStudent>
            )}
            {isInvestor && (
              <FounderInfoInvestor founders={founders}></FounderInfoInvestor>
            )}
          </Row>

          <Row>
            <Col md={6}>
              <Card style={{ height: "100%" }}>
                <Card.Body className="d-flex flex-column">
                  <h2 style={{ textAlign: "left" }}>Who we are.</h2>
                  <p className="descriptionText">
                    {shortDescription.length > 500
                      ? shortDescription.substring(0, 500) + "..."
                      : shortDescription}
                  </p>
                  <div style={{ textAlign: "right" }}>
                    {" "}
                    {/* Add this div with style */}
                    <Button variant="outline-secondary" href="#startupInfo">
                      Learn more
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card style={{ height: "100%" }}>
                <Card.Body className="d-flex flex-column justify-content-between align-content-center">
                  <h2 style={{ textAlign: "left" }}>Who we are looking for.</h2>
                  <div
                    style={{ textAlign: "left" }}
                    className="justify-content-start align-content-start"
                  >
                    {jobOffers.length === 0 ? (
                      <p className="descriptionText">No open job positions.</p>
                    ) : (
                      jobOffers.map((jobOffer, index) => (
                        <p className="descriptionText">
                          {jobOffer.shortDescription + "\n"}
                        </p>
                      ))
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {" "}
                    {/* Add this div with style */}
                    <Button
                      variant="outline-secondary"
                      className="mt-auto"
                      href="#jobDescriptions"
                    >
                      Learn more
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card id="startupInfo">
                <Card.Body>
                  <h2 style={{ textAlign: "left" }}>{startup.slogan}</h2>
                  <p
                    className="descriptionText"
                    dangerouslySetInnerHTML={{ __html: longDescription }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row id="jobDescriptions">
            <Col md={12}>
              <Card>
                <Card.Body>
                  <h2 style={{ textAlign: "left", marginBottom: "30px" }}>
                    Our open job positions!
                  </h2>
                  {jobOffers && jobOffers.length > 0 ? (
                    jobOffers.map((jobOffer, index) => (
                      <>
                        <h3 style={{ textAlign: "left", marginBottom: "10px" }}>
                          {jobOffer.shortDescription}
                        </h3>
                        <Row key={index}>
                          <Container
                            style={{
                              textAlign: "left",
                              marginLeft: 0,
                              paddingLeft: 0,
                            }}
                            className="descriptionText"
                            dangerouslySetInnerHTML={{
                              __html: jobOffer.longDescription,
                            }}
                          ></Container>

                          <Container
                            style={{
                              textAlign: "left",
                              marginLeft: 0,
                              paddingLeft: 0,
                            }}
                            className="descriptionText"
                          >
                            <b>Skills required: </b>
                            {jobOfferSkills[index].map((skill, skillIndex) => (
                              <span key={skillIndex}>
                                {skill.label}

                                {skillIndex !==
                                  jobOfferSkills[index].length - 1 && ", "}
                              </span>
                            ))}
                            <br />
                          </Container>

                          {index !== jobOffers.length - 1 && (
                            <hr
                              style={{
                                borderTop: "1px solid grey",
                                marginTop: "30px",
                              }}
                            />
                          )}
                        </Row>
                      </>
                    ))
                  ) : (
                    <p className="descriptionText">
                      No open job positions at the moment.
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
