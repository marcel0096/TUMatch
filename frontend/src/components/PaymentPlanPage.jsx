import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./PaymentPlanPage.css";
import { useNavigate } from "react-router-dom";
import {
  fetchCheckoutSession,
  fetchSubscriptionInfo,
  switchPlan,
  reactivateSubscription,
} from "./api";
import { Building, Person, FileText } from "react-bootstrap-icons";
import LoadingScreen from "../LoadingScreen";
import { useAuth } from "../AuthContext";

export default function PaymentPlanPage() {
  const [data, setData] = useState("");
  const { setSubscription } = useAuth();
  const [button1Description, setbutton1Description] = useState("");
  const [button2Description, setbutton2Description] = useState("");
  const [isIndividualDisabled, setIndividualDisabled] = useState(false);
  const [isEnterpriseDisabled, setEnterpriseDisabled] = useState(false);
  const [isCustomDisabled, setCustomDisabled] = useState(false);
  const [note1, setNote1] = useState("");
  const [note2, setNote2] = useState("");
  const [note3, setNote3] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Fetch subscription data from the backend and fill buttons/ notes with correct text
   */
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscriptionInfo();
        //switch subscription plan
        if (data.status == "Active") {
          //if true switch plan to Enterprise and deactivate other buton or reversed
          if (data.type === "Individual") {
            setIndividualDisabled(true);
            setEnterpriseDisabled(false);
            setbutton1Description("Your current plan");
            setbutton2Description("Switch to Enterprise");
          } else {
            setbutton1Description("Switch to Individual");
            setbutton2Description("Your current plan");
            setEnterpriseDisabled(true);
            if (data.employeeNumber == 1) {
              setIndividualDisabled(false);
            } else {
              setIndividualDisabled(true);
              setNote1("*Remove employees to switch to Individual plan");
            }
          }
        }
        // subscription was canceled, show renew option
        else if (data.nextPaymentDate == "-" && data.existingSubscription) {
          if (data.type === "Individual") {
            setEnterpriseDisabled(true);
            setbutton1Description("Reactivate Subscription");
            setbutton2Description("-");
          } else {
            setIndividualDisabled(true);
            setbutton2Description("Reactivate Subscription");
            setbutton1Description("-");
          }
        }
        // subscription cannot be created because company does not exist
        else if (data.companyExisting === false) {
          setIndividualDisabled(true);
          setEnterpriseDisabled(true);
          setCustomDisabled(true);
          setbutton1Description("Continue with Individual");
          setbutton2Description("Continue with Enterprise");
          setNote1("*You need to create a company first");
          setNote2("*You need to create a company first");
          setNote3("*You need to create a company first");
        }
        // base case: first time subscription
        else {
          setbutton1Description("Continue with Individual");
          setbutton2Description("Continue with Enterprise");
        }
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subscription info:", error);
      }
    };
    fetchSubscriptionData();
  }, [fetchTrigger]);

  // either switch plan, reactivate subscription or create new checkout session
  const handleContinue = async (amount) => {
    try {
      if (data.status === "Active") {
        await switchPlan(amount);
        setFetchTrigger((prev) => !prev); // Toggle fetchTrigger to re-run useEffect
        setSubscription(true);
      } else if (data.nextPaymentDate === "-" && data.status != "-") {
        await reactivateSubscription();
        setFetchTrigger((prev) => !prev); // Toggle fetchTrigger to re-run useEffect
        setSubscription(true);
      } else {
        const checkoutSession = await fetchCheckoutSession(amount);
        setSubscription(true);
        window.location.href = checkoutSession.url;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleContactUs = () => {
    navigate("/contact-us");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="payment-plan-container">
      <h1 className="text-center">Choose your payment plan</h1>
      <Row className="justify-content-center mt-4">
        <Col md={4} className="plan-column">
          <div className="plan-card">
            <h2 className="heading">
              <Person style={{ fontSize: "1.5em", marginRight: "17px" }} />
              Individual
            </h2>
            <p>Basic plan for a single user</p>
            <h3>
              30€ <span>per month</span>
            </h3>
            <hr className="divider" />
            <h4>Features</h4>
            <ul>
              <li>1 user account</li>
              <li>Access to all TUM related startups</li>
              <li>Reach out to as many founders as you like</li>
              <li>Cancel your subscription anytime</li>
            </ul>
            <Button
              variant="primary"
              className="plan-button"
              onClick={() => handleContinue(30)}
              disabled={isIndividualDisabled}
              style={
                isIndividualDisabled
                  ? {
                      backgroundColor: "#ccc",
                      borderColor: "#ccc",
                      cursor: "not-allowed",
                    }
                  : {}
              }
            >
              {button1Description}
            </Button>
            <div className="note">{note1}</div>
          </div>
        </Col>
        <Col md={4} className="plan-column">
          <div className="plan-card">
            <h2>
              <Building style={{ fontSize: "1.3em", marginRight: "17px" }} />{" "}
              Enterprise
            </h2>
            <p>Advanced plan for multiple users</p>
            <h3>
              70€ <span>per month</span>
            </h3>
            <hr className="divider" />
            <h4>Features</h4>
            <ul className="left-aligned-list">
              <li>Up to 5 user accounts</li>
              <li>Access to all TUM related startups</li>
              <li>Reach out to as many founders as you like</li>
              <li>Cancel your subscription anytime</li>
            </ul>
            <Button
              variant="primary"
              className="plan-button"
              onClick={() => handleContinue(70)}
              disabled={isEnterpriseDisabled}
              style={
                isEnterpriseDisabled
                  ? {
                      backgroundColor: "#ccc",
                      borderColor: "#ccc",
                      cursor: "not-allowed",
                    }
                  : {}
              }
            >
              {button2Description}
            </Button>
            <div className="note">{note2}</div>
          </div>
        </Col>
        <Col md={4} className="plan-column">
          <div className="plan-card">
            <h2>
              <FileText style={{ fontSize: "1.3em", marginRight: "17px" }} />
              Custom
            </h2>
            <p>Individual plan for large enterprises</p>
            <h3>
              {" "}
              <span> Custom Price</span>
            </h3>
            <hr className="divider" />
            <h4>Features</h4>
            <ul className="left-aligned-list">
              <li>Custom number of user accounts</li>
              <li>Access to all TUM related startups</li>
              <li>Reach out to as many founders as you like</li>
              <li>Cancel your subscription anytime</li>
            </ul>
            <Button
              variant="primary"
              className="plan-button"
              onClick={() => handleContactUs()}
              disabled={isCustomDisabled}
              style={
                isCustomDisabled
                  ? {
                      backgroundColor: "#ccc",
                      borderColor: "#ccc",
                      cursor: "not-allowed",
                    }
                  : {}
              }
            >
              Contact us
            </Button>
            <div className="note">{note3}</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
