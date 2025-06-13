import React from "react";
import { format, isSameDay } from "date-fns";

const moodColors = {
  1: "#E11515", // red
  2: "#F78527", // orange
  3: "#F9C22E", // yellow
  4: "#B2D61F", // yellow-green
  5: "#3BC14A", // green
};

const DayTile = ({ day, isCurrentMonth, mood, onClick }) => {
  const backgroundColor = mood ? moodColors[mood.mood] : "#f3f4f6"; // default gray

  // highlight today with a border
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={`day-tile ${isCurrentMonth ? "" : "faded"}`}
      onClick={() => onClick(day)}
      style={{
        backgroundColor,
        border: isToday ? "2px solid #3b82f6" : "1px solid #ddd",
        cursor: "pointer",
        borderRadius: "6px",
        padding: "10px",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      <div className="day-number" style={{ fontWeight: "bold" }}>
        {format(day, "d")}
      </div>
      {mood && (
        <div
          className="mood-emoji"
          style={{ fontSize: "1.5rem", marginTop: "5px" }}
        >
          {["😢", "🙁", "😐", "🙂", "😁"][mood.mood - 1]}
        </div>
      )}
      {mood?.note && (
        <div
          className="notes-indicator"
          title={mood.note}
          style={{ marginTop: "4px", fontSize: "1.2rem" }}
        ></div>
      )}
    </div>
  );
};

export default DayTile;
