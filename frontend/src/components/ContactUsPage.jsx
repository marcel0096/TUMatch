import { useEffect, useState } from "react";
import tumatchLogo from "../assets/TUMatch_logo.png";
import "./ContactUsPage.css";
import { getUser } from "./api";
import LoadingScreen from "../LoadingScreen";

const ContactUsPage = () => {
  const [backgroundColor, setBackgroundColor] = useState("#1B386A");
  const [loading, setLoading] = useState(true);
  const [firstUseEffectDone, setFirstUseEffectDone] = useState(false);
  useEffect(() => {
    // Add class to body to make it non-scrollable
    document.body.classList.add("no-scroll");

    // Cleanup to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("no-scroll");
    };
    setFirstUseEffectDone(true);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser();
        if (user.profession === "student") {
          setBackgroundColor("#1B386A");
        } else {
          setBackgroundColor("#1C3933");
        }
      } catch (error) {
        //console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [firstUseEffectDone]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="contact-page" style={{ backgroundColor }}>
      <img src={tumatchLogo} alt="TUMatch" className="logo" />
      <h2 className="contactText">CONTACT</h2>
      <h2 className="emailText">
        <a href="mailto:tumatch@fastmail.com">tumatch@fastmail.com</a>
      </h2>
    </div>
  );
};

export default ContactUsPage;
