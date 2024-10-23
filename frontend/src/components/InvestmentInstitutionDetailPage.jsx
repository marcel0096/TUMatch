import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import "./DetailPage.css";
import {
  fetchCompanyByEmployeeId,
  fetchCompanyByCompanyId,
  fetchUserById,
} from "./api";
import InvestmentInstitutionSidebar from "./sidebar/InvestmentInstitutionSidebar";
import LoadingScreen from "../LoadingScreen";
import {
  FaEnvelope,
  FaLinkedin,
  FaUserCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function InvestmentInstitutionDetailPage() {
  const { userId, profession } = useAuth();
  const navigate = useNavigate();

  const [investmentInstitutionId, setInvestmentInstitutionId] = useState(null);
  const [investmentInstitutionName, setInvestmentInstitutionName] =
    useState("");
  const [industries, setIndustries] = useState([]);
  const [rangeOfInvestment, setRangeOfInvestment] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [slogan, setSlogan] = useState("");
  const [description, setDescription] = useState("");
  const [paid, setPaid] = useState(false);
  const [investmentInstitution, setInvestmentInstitution] = useState(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [isStudent, setIsStudent] = useState(false);
  const [isInvestor, setIsInvestor] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestmentInstitutionData = async () => {
      try {
        let investmentInstitution = null;
        setLoading(true);
        if (id !== null) {
          investmentInstitution = await fetchCompanyByCompanyId(id);
        } else {
          investmentInstitution = await fetchCompanyByEmployeeId(userId);
        }
        setInvestmentInstitutionId(investmentInstitution._id || null);
        setInvestmentInstitutionName(investmentInstitution.companyName || "");
        setIndustries(investmentInstitution.industries || []);
        setRangeOfInvestment(investmentInstitution.rangeOfInvestment || "");
        setInvestorType(investmentInstitution.investorType || "");
        setWebsiteURL(investmentInstitution.websiteURL || "");
        setEmployees(investmentInstitution.employees || []);
        setSlogan(investmentInstitution.slogan || "");
        setDescription(investmentInstitution.description || "");
        setPaid(investmentInstitution.paid || false);
        setInvestmentInstitution(investmentInstitution);
        setIsEmployee(investmentInstitution.employees.includes(userId));
        setIsInvestor(profession === "investor");
        setIsStudent(profession === "student");
      } catch (error) {
        // investment institution not found
        console.error("Investment Institution not found");
        if (profession === "investor") {
          navigate("/edit-investment-institution");
        } else {
          navigate("/");
        }
      }
    };
    fetchInvestmentInstitutionData();
  }, []);

  useEffect(() => {
    async function fetchEmployeeDetails() {
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
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            position: user.position,
            linkedinURL: user.linkedinURL,
            profilePicture: userProfilePicture,
          };
        })
      );
      setEmployeeDetails(userDetails);
    }
    if (employees && employees.length > 0) {
      fetchEmployeeDetails();
    }
    setLoading(false);
  }, [employees]);

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
          {investmentInstitution && (
            <InvestmentInstitutionSidebar
              investmentInstitution={investmentInstitution}
              isEmployee={isEmployee}
            />
          )}
        </Col>

        <Col
          md={8}
          style={{
            maxHeight: "100vh",
            overflowY: "auto",
            paddingBottom: "0px",
          }}
        >
          <Row>
            <Col>
              <Card id="investmentInstitutionInfo">
                <Card.Body>
                  <h2 style={{ textAlign: "left" }}>{slogan}</h2>
                  <p className="descriptionText">{description}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {employeeDetails &&
              employeeDetails.map((employee, index) => (
                <Col md={4} key={index} className="mb-4">
                  <Card
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <Card.Body>
                      <Row>
                        {employee.profilePicture ? (
                          <img
                            src={employee.profilePicture}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            style={{ width: "100%", borderRadius: "50%" }}
                          />
                        ) : (
                          <FaUserCircle
                            style={{ width: "100%", height: "100%" }}
                          ></FaUserCircle>
                        )}
                      </Row>
                      <Row className="mt-2, mb-0">
                        <Card.Title
                          style={{ textAlign: "center", fontSize: "25px" }}
                        >{`${employee.firstName} ${employee.lastName}`}</Card.Title>
                      </Row>
                      <Row className="mt-0">
                        <Card.Text style={{ textAlign: "center" }}>{`${
                          employee.position || " Employee "
                        }`}</Card.Text>
                      </Row>
                      <Row className="mt-0">
                        <Card.Text style={{ textAlign: "center" }}>
                          <FaEnvelope style={{ marginRight: "5px" }} />
                          {`${employee.email || "-"}`}
                        </Card.Text>
                      </Row>
                      <Row className="mt-0">
                        <Card.Text style={{ textAlign: "center" }}>
                          <FaLinkedin style={{ marginRight: "5px" }} />
                          <a
                            className="sidebar-text"
                            href={
                              employee.linkedinURL != null &&
                              employee.linkedinURL.startsWith("http")
                                ? employee.linkedinURL
                                : `https://${employee.linkedinURL}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--bs-primary)" }}
                          >
                            {employee.linkedinURL ? (
                              <>
                                Visit my profile{" "}
                                <FaExternalLinkAlt
                                  style={{
                                    marginLeft: "5px",
                                    color: "var(--bs-primary)",
                                  }}
                                />
                              </>
                            ) : (
                              "-"
                            )}
                          </a>
                        </Card.Text>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
