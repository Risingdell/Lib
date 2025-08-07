import React, { useState, useContext } from "react";
import axios from "axios";
import "./App.css";
import { UserContext } from "./Context/UserContext";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import MainPage from "./Pages/MainPage";
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
export default App;
