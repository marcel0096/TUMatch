import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Adjust the import path as needed

const NotPrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn } = useAuth();

  return !isLoggedIn ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/startup-overview" replace /> // 'replace' deletes the previous route from history
  );
};

// PrivateRoute if not verified email
const PrivateUnverifiedRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" replace /> // 'replace' deletes the previous route from history
  );
};

const PrivateVerifiedRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, emailVerified } = useAuth();
  return isLoggedIn && emailVerified ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/unverified-profile" replace /> // 'replace' deletes the previous route from history
  );
};

// PrivateStudentRoute
const PrivateStudentRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, profession, emailVerified } = useAuth();

  return emailVerified && isLoggedIn && profession === "student" ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/startup-overview" replace /> // 'replace' deletes the previous route from history
  );
};

// PrivateInvestorRoute
const PrivateInvestorRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, profession, emailVerified } = useAuth();

  return isLoggedIn && emailVerified && profession === "investor" ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/startup-overview" replace /> // 'replace' deletes the previous route from history
  );
};

// PrivatePaidInvestorRoute
const PrivateStudentOrPaidInvestorRoute = ({
  component: Component,
  ...rest
}) => {
  const { isLoggedIn, profession, validSubscription, emailVerified } =
    useAuth();

  return isLoggedIn &&
    emailVerified &&
    ((profession === "investor" && validSubscription) ||
      profession === "student") ? (
    <Component {...rest} />
  ) : profession === "investor" ? (
    <Navigate to="/investment-institution" replace /> // 'replace' deletes the previous route from history
  ) : (
    <Navigate to="/profile" replace /> // 'replace' deletes the previous route from history
  );
};

export {
  NotPrivateRoute,
  PrivateUnverifiedRoute,
  PrivateVerifiedRoute,
  PrivateStudentRoute,
  PrivateInvestorRoute,
  PrivateStudentOrPaidInvestorRoute,
};
