import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { verifyVerificationToken } from "./api";
import LoadingScreen from "../LoadingScreen";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, isLoggedIn, profession, verifyUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!isLoggedIn) {
          navigate("/login", { state: { from: location } });
          return;
        }
        const data = await verifyVerificationToken(token, userId);
        await verifyUser(data["verified"]);
        if (profession === "student") {
          navigate("/edit-profile");
        } else {
          navigate("/edit-investor");
        }
      } catch (error) {
        console.error("Error verifying email token:", error);
        alert(
          "An error occurred while verifying the email token. Please try again later."
        );
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  });
  if (isLoading) {
    return <LoadingScreen />;
  }
}
export default VerifyEmailPage;
