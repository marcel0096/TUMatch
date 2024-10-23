import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./PaymentPlanPage.css";
import { fetchSubscriptionInfo, cancelSubscription } from "./api";
import LoadingScreen from "../LoadingScreen";
import { useAuth } from "../AuthContext";

const SubscriptionInfoPage = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState({});
  const [isCancelDisabled, setCancelDisabled] = useState(false);
  const [dotClass, setDotClass] = useState("dot inactive");
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setSubscription } = useAuth();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscriptionInfo();
        setSubscriptionInfo(data);

        //Disable the cancel Subscription button if:
        if (
          data.companyExisting === false ||
          data.existingSubscription === false
        ) {
          setCancelDisabled(true);
        }

        //Set the dot color based on the subscription status
        if (data.status === "Active") {
          setDotClass("dot active");
        } else if (data.existingSubscription === false) {
          setDotClass("dot invisible");
        } else if (data.status === "Canceled") {
          setDotClass("dot inactive");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subscription info:", error);
      }
    };
    fetchSubscriptionData();
  }, [fetchTrigger]);

  const handleNavigateToPaymentPlan = () => {
    navigate("/payment-plan");
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setSubscription(false);
      setFetchTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="payment-plan-container">
      <h1 className="text-center">Your Payment Plan</h1>
      <Row className="justify-content-center mt-4">
        <Col md={4} className="plan-column">
          <div className="plan-card">
            <h2>{subscriptionInfo.titel}</h2>
            <p>{subscriptionInfo.description}</p>
            <h3>
              {subscriptionInfo.amount}€ <span>per month</span>
            </h3>
            <hr className="divider" />
            <h4>Subscription Info</h4>
            <ul className="left-aligned-list">
              <li>Type: {subscriptionInfo.type}</li>
              <li>
                <div className="status-item">
                  Status: {subscriptionInfo.status}
                  <span className={dotClass}></span>
                </div>
              </li>
              <li>Next Payment: {subscriptionInfo.nextPaymentDate}</li>
              <li>Payed by: {subscriptionInfo.payerName}</li>
            </ul>
            <Button
              variant="primary"
              className="plan-button"
              onClick={() => handleNavigateToPaymentPlan()}
            >
              View Plans
            </Button>
            <Button
              variant="danger"
              className="plan-button"
              onClick={() => handleCancelSubscription()}
              disabled={isCancelDisabled}
              style={
                isCancelDisabled
                  ? {
                      backgroundColor: "#ccc",
                      borderColor: "#ccc",
                      cursor: "not-allowed",
                    }
                  : {}
              }
            >
              Cancel Subscription
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionInfoPage;
