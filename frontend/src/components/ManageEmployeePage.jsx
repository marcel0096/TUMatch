import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Card,
} from "react-bootstrap";
import {
  fetchCompanyByEmployeeId,
  getNewInvitationCode,
  fetchUserById,
} from "./api";
import { useAuth } from "../AuthContext";
import { FaUserCircle, FaTrash } from "react-icons/fa";
import LoadingScreen from "../LoadingScreen";

export default function ManageEmployeePage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [investmentInstitutionId, setInvestmentInstitutionId] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitationLink, setInvitationLink] = useState("");
  const invitationLinkPre = "http://localhost:3000/invite?companyCode=";
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [memberIndexToRemove, setMemberIndexToRemove] = useState(null);

  useEffect(() => {
    const fetchInvestmentInstitutionData = async () => {
      try {
        const investmentInstitution = await fetchCompanyByEmployeeId(userId);
        setLoading(true);
        setInvestmentInstitutionId(investmentInstitution._id || null);

        setInvitationLink(
          invitationLinkPre + investmentInstitution.invitationCode[0] || ""
        );
        setEmployees(investmentInstitution.employees);
        setCompanyName(investmentInstitution.companyName);
      } catch (error) {
        console.error("Error fetching startup data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentInstitutionData();
  }, [userId, navigate]);

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
            firstName: user.firstName,
            lastName: user.lastName,
            profession: user.profession,
            profilePicture: userProfilePicture,
          };
        })
      );
      setEmployeeDetails(userDetails);
    }
    if (employees && employees.length > 0) {
      fetchEmployeeDetails();
    }
  }, [employees]);

  const handleDeleteClick = (index) => {
    setShowDeleteConfirmation(true);
    setMemberIndexToRemove(index);
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

  async function removeEmployeeFromInvestmentInstitution() {
    try {
      const employeeId = employees[memberIndexToRemove];
      const requestBody = JSON.stringify({ _id: employeeId });

      const response = await fetch(
        "http://localhost:8080/investment-institutions/removeEmployeeByID",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
          credentials: "include",
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        const text = await response.text();
        alert("Oops! Something went wrong. Please try again.");
        // setShowError(true);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  const confirmDelete = () => {
    if (employees.length === 1) {
      handleRemoveEmployee(memberIndexToRemove);
      deleteInvestmentInsitution(); // delete investment institution
      setShowDeleteConfirmation(false);
      setMemberIndexToRemove(null);
    } else {
      handleRemoveEmployee(memberIndexToRemove);
      removeEmployeeFromInvestmentInstitution(); // delete employee
      setShowDeleteConfirmation(false);
      setMemberIndexToRemove(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setMemberIndexToRemove(null);
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

  const handleRemoveEmployee = (index) => {
    const newEmployees = [...employees];
    newEmployees.splice(index, 1);
    setEmployees(newEmployees);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="edit-container">
      <h1 className="edit-container">Manage employees of {companyName}!</h1>

      {investmentInstitutionId && (
        <Container>
          <h3 className="custom-heading">Employees</h3>
          <Row>
            {employees &&
              employeeDetails.map((member, index) => (
                <Col md={4} key={index} className="mb-4">
                  <Card
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "0.25rem",
                      height: "100%",
                    }}
                  >
                    <Card.Body>
                      <Row>
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={`${member.firstName} ${member.lastName}`}
                            style={{ width: "100%", borderRadius: "50%" }}
                          />
                        ) : (
                          <FaUserCircle
                            style={{ width: "100%", height: "100%" }}
                          ></FaUserCircle>
                        )}
                      </Row>
                      <Row className="mt-2">
                        <Card.Title
                          style={{ textAlign: "center" }}
                        >{`${member.firstName} ${member.lastName}`}</Card.Title>
                      </Row>
                      <Row className="mt-2">
                        <Card.Text
                          style={{ textAlign: "center", color: "grey" }}
                        >
                          {member.position}
                        </Card.Text>
                      </Row>
                      <Row className="mt-2">
                        <Button
                          variant="outline-danger"
                          style={{ margin: "auto" }} // Centers the button in the row
                          onClick={() => handleDeleteClick(index)}
                        >
                          <FaTrash style={{ marginRight: "5px" }} />
                          Remove
                        </Button>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Container>
      )}

      {investmentInstitutionId && (
        <Container>
          <h3 className="custom-heading">Invite new employees</h3>
          <Row className="mt-3 align-items-center justify-content-center">
            <Col md={11} className="align-items-center justify-content-center">
              <Form.Group>
                <Form.Control type="text" value={invitationLink} readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3 align-items-center justify-content-center">
            <Col md={4} className=" align-items-center justify-content-center">
              <Button variant="outline-secondary" onClick={copyInvitationLink}>
                Copy Invitation Link
              </Button>
            </Col>
            <Col md={4} className=" align-items-center justify-content-center">
              <Button
                variant="outline-secondary"
                onClick={createNewInvitationLink}
              >
                Create new invitation link
              </Button>
            </Col>
          </Row>
        </Container>
      )}

      <Modal show={showDeleteConfirmation} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {employees.length === 1
            ? "Are you sure you want to remove this user? This will also delete your associated investment institution."
            : "Are you sure you want to remove this user from your investment institution?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
