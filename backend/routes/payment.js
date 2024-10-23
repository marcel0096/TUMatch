import {
  handlePaymentAction,
  handleCreateCheckoutSession,
  handleCancelSubscription,
  handleGetSubscriptionInfo,
  handleSwitchPlan,
  handleReactivateSubscription,
} from "../controller/paymentController.js";
import checkAuthentication from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handlePaymentAction
);
router.post(
  "/create-checkout-session",
  checkAuthentication,
  handleCreateCheckoutSession
);
router.post(
  "/cancel-subscription",
  checkAuthentication,
  handleCancelSubscription
);
router.get(
  "/subscription-info",
  checkAuthentication,
  handleGetSubscriptionInfo
);
router.put("/switch-plan", checkAuthentication, handleSwitchPlan);
router.put(
  "/reactivate-subscription",
  checkAuthentication,
  handleReactivateSubscription
);

export default router;
