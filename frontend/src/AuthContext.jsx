import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const isAuth = localStorage.getItem("isLoggedIn");
    return isAuth === "true";
  });
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? storedUserId : null;
  });
  const [profession, setProfession] = useState(() => {
    const storedProfession = localStorage.getItem("profession");
    return storedProfession ? storedProfession : null;
  });
  const [validSubscription, setValidSubscription] = useState(() => {
    const storedValidSubscription = localStorage.getItem("validSubscription");
    return storedValidSubscription === "true";
  });
  const [emailVerified, setEmailVerified] = useState(() => {
    const storedEmailVerified = localStorage.getItem("emailVerified");
    return storedEmailVerified === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
    localStorage.setItem("validSubscription", validSubscription);
    localStorage.setItem("emailVerified", emailVerified);
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
    if (profession) {
      localStorage.setItem("profession", profession);
    } else {
      localStorage.removeItem("profession");
    }
  }, [isLoggedIn, userId, profession, validSubscription, emailVerified]);

  const login = (
    userId,
    profession = null,
    validSubscription = false,
    mailVerified = false
  ) => {
    setIsLoggedIn(true);
    setUserId(userId);
    setProfession(profession);
    setValidSubscription(validSubscription);
    setEmailVerified(mailVerified);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setProfession(null);
    setValidSubscription(false);
    setEmailVerified(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("profession");
    localStorage.removeItem("validSubscription");
    localStorage.removeItem("emailVerified");
  };

  const setSubscription = (subscription) => {
    setValidSubscription(subscription);
  };

  const verifyUser = (mailVerified) => {
    setEmailVerified(mailVerified);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        profession,
        validSubscription,
        emailVerified,
        login,
        logout,
        verifyUser,
        setSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
