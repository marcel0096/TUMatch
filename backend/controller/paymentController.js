import Stripe from "stripe";
import Model from "../models/investmentInstitutionModel.js";
import config from "../config.js";

//create a new instance of stripe
const stripe = new Stripe(
  "stripe_api_key"
);

const handleCreateCheckoutSession = async (req, res) => {
  const userId = req.userId;
  const amount = req.query["amount"];
  let price = "";
  //switch between 30 and 70 Euro subscription
  if (amount == "30") {
    price = "price_1PYpANRuSYCxeb1QFgsAFGY9";
  } else if (amount == "70") {
    price = "price_1PYpBARuSYCxeb1Qxe0S9eUD";
  }

  //create a new checkout session (link for the user)
  const session = await stripe.checkout.sessions.create({
    success_url: "http://localhost:3000/SubscriptionInfoPage",
    line_items: [
      {
        price: price,
        quantity: 1,
      },
    ],
    mode: "subscription",
    client_reference_id: userId,
  });
  return res.status(200).json({ url: session.url });
};

/*
 * cancels the subscription at the end of the current period.
 * this method is called when a user is deleted
 */
const cancelSubscriptionBySubscriptionId = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return "Subscription canceled successfully";
  } catch (error) {
    return "Error retrieving Stripe session or customer";
  }
};

/**
 * this is called when the user wants to cancel the subscription (in the programm)
 */
const handleCancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const company = await Model.findOne({ employees: userId }).populate(
      "subscription.payerId"
    );

    const subscriptionId = company.subscription.subscriptionId;
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return res.send("Subscription canceled successfully");
  } catch (error) {
    return res
      .status(500)
      .send(`Error retrieving Stripe session or customer: ${error.message}`);
  }
};

const handleReactivateSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const company = await Model.findOne({ employees: userId }).populate(
      "subscription.payerId"
    );

    const subscriptionId = company.subscription.subscriptionId;
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return res.send("Subscription renewed successfully");
  } catch (error) {
    return res
      .status(500)
      .send(`Error retrieving Stripe session or customer: ${error.message}`);
  }
};

/**
 * Handle the request to get the subscription information of a company.
 * This function is called on the subscription info page, as well as payment plan page.
 */
const handleGetSubscriptionInfo = async (req, res) => {
  const userId = req.userId;
  let company = await Model.findOne({ employees: userId });
  let result = {
    employeeNumber: 0,
    titel: "No active subscription",
    companyExisting: false,
    existingSubscription: false,
    status: "-",
    amount: 0,
    nextPaymentDate: "-",
    type: "-",
    payerName: "-",
    subscriptionOwner: true,
    description: "Select a plan to continue",
  };

  if (!company) {
    return res.status(200).send(result);
  }

  if (!company.subscription) {
    result.companyExisting = true;
    return res.status(200).send(result);
  }

  company = await Model.findOne({ employees: userId }).populate(
    "subscription.payerId"
  );
  const subscriptionId = company.subscription.subscriptionId;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const nextPaymentDate = subscription.current_period_end;
  const nextPaymentDateFormatted = formatDate(new Date(nextPaymentDate * 1000));
  result.employeeNumber = company.employees.length;

  if (userId != company.subscription.payerId._id.toHexString()) {
    result.subscriptionOwner = false;
  }

  //switch between 30 and 70 Euro subscription
  if (subscription.plan.amount == 3000) {
    result.amount = 30;
    result.titel = "Individual";
    result.type = "Individual";
    result.description = "Basic plan for a single user";
  } else if (subscription.plan.amount == 7000) {
    result.amount = 70;
    result.titel = "Enterprise";
    result.type = "Enterprise";
    result.description = "Advanced plan for multiple users";
  }
  result.companyExisting = true;

  result.existingSubscription = true;
  result.status = "Active";
  result.nextPaymentDate = nextPaymentDateFormatted;
  result.payerName =
    company.subscription.payerId.firstName +
    " " +
    company.subscription.payerId.lastName;

  if (subscription.cancel_at_period_end == true) {
    result.status = "canceled (" + nextPaymentDateFormatted + ")";
    result.nextPaymentDate = "-";
  }
  return res.status(200).send(result);
};

const handleSwitchPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const company = await Model.findOne({ employees: userId }).populate(
      "subscription.payerId"
    );

    const amount = req.query["amount"];
    let priceId = "";
    // switch between 30 and 70 Euro subscription
    // for switch to 30 check, that no more than 1 employee is in the company
    if (amount == "30") {
      priceId = "price_1PYpANRuSYCxeb1QFgsAFGY9";
      const employeeNumber = company.employees.length;
      if (employeeNumber > 1) {
        return res
          .status(401)
          .send(
            "Error: You can't switch to the individual plan, because you have more than one employee in your company"
          );
      }
    } else if (amount == "70") {
      priceId = "price_1PYpBARuSYCxeb1Qxe0S9eUD";
    }

    const subscriptionId = company.subscription.subscriptionId;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
      }
    );
    return res.status(200).send("Subscription upgraded successfully");
  } catch (error) {
    console.error("Error upgrading subscription:");
    return res.status(401).send("Error upgrading subscription:", error);
  }
};

const checkMaxEmployees = async (company) => {
  try {
    if (!company.subscription) {
      return 1;
    }
    const subscription = await stripe.subscriptions.retrieve(
      company.subscription.subscriptionId
    );

    //switch between 30 and 70 Euro subscription
    if (subscription.plan.amount == 3000) {
      return 1;
    } else if (subscription.plan.amount == 7000) {
      return 5;
    }
  } catch (error) {
    return null;
  }
};

/**
 * This handles the stripe webhook events.
 * When a payment is successful, these functions are called.
 */
const handlePaymentAction = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const body = await req.body;
  let event;

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      config.stripe_endpoint_secret
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  const data = event.data;

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      try {
        // Retrieve the payment intent to get the customer ID
        const userId = checkoutSession.client_reference_id;
        const subscriptionId = checkoutSession.subscription;
        const stripeUserId = checkoutSession.customer;
        let company = await Model.findOne({ employees: userId });

        // Update the subscription field
        company.subscription = {
          payerId: userId,
          stripeUserId: stripeUserId,
          subscriptionId: subscriptionId,
        };
        // Save the updated document
        await company.save();
      } catch (error) {
        console.error("Error retrieving Stripe session or customer:", error);
        res
          .status(500)
          .send(
            `Error retrieving Stripe session or customer: ${error.message}`
          );
      }
      break;
    // ... handle other event types
    default:
  }
  // Return a 200 res to acknowledge receipt of the event
  res.send();
};

/**
 * Format the stripe date to a readable format
 */
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Check if user has access to e.g. Startup Overview
 * -> This is the case if the user is a student or has an active subscription
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} {error: boolean, access: boolean}
 */
const handleCheckHasPaid = async (userId) => {
  try {
    let company = await Model.findOne({ employees: userId });
    if (!company) {
      return false;
    }
    if (!company.subscription) {
      return false;
    }
    //Get Stripe Subscription via InvestmentInstitution
    const subscriptionId = company.subscription.subscriptionId;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    //Check if subscription is active
    if (subscription.status === "active") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return null; // Error handling will be done after calling method
  }
};

export {
  handlePaymentAction,
  handleCreateCheckoutSession,
  handleCancelSubscription,
  handleGetSubscriptionInfo,
  handleSwitchPlan,
  handleReactivateSubscription,
  handleCheckHasPaid,
  cancelSubscriptionBySubscriptionId,
  checkMaxEmployees,
};
