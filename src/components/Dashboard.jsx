import React, { useEffect, useState } from "react";
import axios from "axios";
import { isSameDay } from "date-fns";
import Calendar from "./Calendar";
import MoodEditor from "./moodEditor";

function Dashboard() {
  const [moods, setMoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    console.log("Dashboard mounted - checking auth");
    const token = localStorage.getItem("token");
    console.log("Stored token:", token);

    if (!token) {
      console.log("No token found - redirecting to login");
      redirectToLogin();
      return;
    }

    const verifyToken = async () => {
      try {
        console.log("Verifying token with backend...");
        const verification = await axios.get(
          "https://natural-victory-production.up.railway.app/api/verify-token",
          { headers: { "auth-token": token } }
        );

        console.log("Verification response:", verification.data);

        if (!verification.data.valid) {
          throw new Error(verification.data.error || "Invalid token");
        }

        console.log("Token valid - loading moods...");
        const moodsResponse = await axios.get(
          "https://natural-victory-production.up.railway.app/moods",
          {
            headers: { "auth-token": token },
          }
        );

        setMoods(
          moodsResponse.data.map((m) => ({ ...m, date: new Date(m.date) }))
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Auth verification failed:", error);
        setAuthError(
          error.response?.data?.error || "Session expired. Please login again."
        );
        setTimeout(() => redirectToLogin(), 2000); // Give user time to see message
      }
    };

    verifyToken();
  }, []);

  const redirectToLogin = () => {
    console.log("Redirecting to login...");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setShowEditor(true);
  };
  const fetchMoods = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://natural-victory-production.up.railway.app/moods",
        {
          headers: { "auth-token": token },
        }
      );
      setMoods(
        response.data.map((m) => ({
          ...m,
          date: new Date(m.date),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch moods:", error);
    }
  };

  const handleSaveMood = async (date, mood, note) => {
    try {
      // Create date in UTC but keep local date values
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );

      await axios.post(
        "/moods",
        {
          date: utcDate.toISOString(), // Send as ISO string
          mood,
          note,
        },
        {
          headers: { "auth-token": localStorage.getItem("token") },
        }
      );

      // Refresh moods
      await fetchMoods();
    } catch (error) {
      console.error("Failed to save mood:", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (authError) {
    return <div className="auth-error">{authError}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome {localStorage.getItem("username")}</h2>
        <button className="logout-btn" onClick={redirectToLogin}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <Calendar moods={moods} onDayClick={handleDayClick} />

        {showEditor && (
          <MoodEditor
            date={selectedDate}
            mood={moods.find((m) => isSameDay(new Date(m.date), selectedDate))}
            onSave={handleSaveMood}
            onClose={() => setShowEditor(false)}
          />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
