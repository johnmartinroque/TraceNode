import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./screens/Home";
import LandingPage from "./screens/LandingPage";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function HomeScreen() {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    try {
      const parsedUser = JSON.parse(userInfo);

      if (parsedUser?.access_token && parsedUser?.user) {
        return <Home />;
      }
    } catch (error) {
      console.error("Invalid userInfo");
    }
  }

  return <LandingPage />;
}

function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
