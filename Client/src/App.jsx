import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { linkWithCredential } from "firebase/auth";
import ProtectedRoute from "./Components/ProtectedRoute";
import Builder from "./pages/Builder";
export const ServerUrl = "http://localhost:8000";
import Navbar from "./Components/Navbar";
import Billing from "./pages/Billing";
import axios from "axios";
import { Toaster } from "react-hot-toast";
export const CLIENT_URL = "http://localhost:5173";
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(ServerUrl + "/api/user/current-user", {
          withCredentials: true,
        });
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Navbar setUser={setUser} user={user} />
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route
                  path="/builder"
                  element={<Builder user={user} setUser={setUser} />}
                />
                <Route
                  path="/billing"
                  element={<Billing user={user} setUser={setUser} />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
