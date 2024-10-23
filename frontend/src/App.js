import "bootstrap/dist/css/bootstrap.min.css";
import {
  TopBar,
  LandingPage,
  SignUpScreen,
  LogInScreen,
  LoggedOutPage,
  NotVerifiedProfilePage,
  EditProfilePage,
  EditStartupPage,
  EditInvestmentInstitutionPage,
  InvestmentInstitutionDetailPage,
  SubscriptionInfoPage,
  StartupDetailPage,
  UserDetailPage,
  StartupOverviewPage,
  AcceptInvitationPage,
  Chat,
  UserDeletedPage,
  PaymentPlanPage,
  VerifyEmailPage,
  TermsOfUsePage,
  PrivacyPolicyPage,
  ContactUsPage,
  EditInvestorPage,
  ManageCoFounderPage,
  ManageEmployeePage,
  ChangePasswordPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./components";
import {
  NotPrivateRoute,
  PrivateUnverifiedRoute,
  PrivateVerifiedRoute,
  PrivateStudentRoute,
  PrivateInvestorRoute,
  PrivateStudentOrPaidInvestorRoute,
} from "./PrivateRoute";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import io from "socket.io-client";
import SocketContext from "./SocketContext";
import { NotificationProvider } from "./NotificationContext";
import Footer from "./components/Footer";

const socket = io("http://localhost:4000");

function App() {
  return (
    <div className="App">
      <div id="main-content">
        <AuthProvider>
          <SocketContext.Provider value={socket}>
            <NotificationProvider>
              <BrowserRouter>
                <TopBar />

                <Routes>
                  {/* open routes */}
                  <Route path="/landing-page" element={<LandingPage />} />
                  <Route path="/logged-out" element={<LoggedOutPage />} />
                  <Route path="/user-deleted" element={<UserDeletedPage />} />
                  <Route path="/invite" element={<AcceptInvitationPage />} />
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route path="/terms-of-use" element={<TermsOfUsePage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route
                    path="/privacy-policy"
                    element={<PrivacyPolicyPage />}
                  />
                  <Route path="/contact-us" element={<ContactUsPage />} />

                  {/* routes, only accessible when logged out */}
                  <Route
                    path="/"
                    element={<NotPrivateRoute component={LandingPage} />}
                  />
                  <Route
                    path="/signup"
                    element={<NotPrivateRoute component={SignUpScreen} />}
                  />
                  <Route
                    path="/login"
                    element={<NotPrivateRoute component={LogInScreen} />}
                  />

                  {/* routes, only accessible when logged in and not verfified */}
                  <Route
                    path="/unverified-profile"
                    element={
                      <PrivateUnverifiedRoute
                        component={NotVerifiedProfilePage}
                      />
                    }
                  />

                  <Route
                    path="/change-password"
                    element={
                      <PrivateVerifiedRoute component={ChangePasswordPage} />
                    }
                  />

                  {/* routes, only accessible when logged in and email verified */}
                  <Route
                    path="/investment-institution"
                    element={
                      <PrivateVerifiedRoute
                        component={InvestmentInstitutionDetailPage}
                      />
                    }
                  />
                  <Route
                    path="/chat"
                    element={<PrivateVerifiedRoute component={Chat} />}
                  />

                  {/* route, only accessible for students that are logged in and have email verified */}
                  <Route
                    path="/user"
                    element={<PrivateStudentRoute component={UserDetailPage} />}
                  />
                  <Route
                    path="/edit-profile"
                    element={
                      <PrivateStudentRoute component={EditProfilePage} />
                    }
                  />
                  <Route
                    path="/edit-startup"
                    element={
                      <PrivateStudentRoute component={EditStartupPage} />
                    }
                  />

                  {/* routes, only accessible for investors that are logged in and have email verified */}
                  <Route
                    path="/edit-investment-institution"
                    element={
                      <PrivateInvestorRoute
                        component={EditInvestmentInstitutionPage}
                      />
                    }
                  />
                  <Route
                    path="/edit-investor"
                    element={
                      <PrivateInvestorRoute component={EditInvestorPage} />
                    }
                  />
                  <Route
                    path="/SubscriptionInfoPage"
                    element={
                      <PrivateInvestorRoute component={SubscriptionInfoPage} />
                    }
                  />
                  <Route
                    path="/payment-plan"
                    element={
                      <PrivateInvestorRoute component={PaymentPlanPage} />
                    }
                  />

                  {/* routes, only accessible for students or paid investors that are logged in and have email verified */}
                  <Route
                    path="/startup"
                    element={
                      <PrivateStudentOrPaidInvestorRoute
                        component={StartupDetailPage}
                      />
                    }
                  />
                  <Route
                    path="/startup-overview"
                    element={
                      <PrivateStudentOrPaidInvestorRoute
                        component={StartupOverviewPage}
                      />
                    }
                  />
                  <Route
                    path="/manage-cofounders"
                    element={
                      <PrivateStudentRoute component={ManageCoFounderPage} />
                    }
                  />
                  <Route
                    path="/manage-employees"
                    element={
                      <PrivateInvestorRoute component={ManageEmployeePage} />
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </SocketContext.Provider>
        </AuthProvider>
      </div>
      <Footer />
    </div>
  );
}

export default App;
