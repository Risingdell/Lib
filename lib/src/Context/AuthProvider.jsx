import React, { createContext, useState } from "react";

// Create the context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds current logged-in user data

  const login = (userData) => {
    setUser(userData); // Set user when login is successful
  };

  const logout = () => {
    setUser(null); // Clear user on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
