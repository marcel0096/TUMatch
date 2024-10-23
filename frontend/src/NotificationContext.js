import React, { createContext, useState, useContext, useEffect } from "react";

//Create the context
const NotificationContext = createContext();

//Create a provider component
export const NotificationProvider = ({ children }) => {
  const [newNotification, setNewNotification] = useState(null);

  // Function to update the notification
  const updateNotification = (notification) => {
    setNewNotification(notification);
  };

  useEffect(() => {}, [newNotification]);

  return (
    <NotificationContext.Provider
      value={{ newNotification, updateNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// export hook to use the notification context
export const useNotification = () => useContext(NotificationContext);
