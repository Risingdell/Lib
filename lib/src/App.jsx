import React, { useState,useContext } from "react";
import axios from "axios";
import "./App.css";
import { UserContext } from "./Context/UserContext";
import { Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import MainPage from "./Pages/MainPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} /> {/* ✅ added this */}
      </Routes>
    </div>
  );
}
export default App;
