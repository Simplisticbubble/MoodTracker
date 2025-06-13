import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
} from "date-fns";
import DayTile from "./DayTile"; // We'll create this component next

const Calendar = ({ moods, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the first week
  const startDay = monthStart.getDay(); // 0 (Sunday) to 6 (Saturday)
  const prevMonthDays =
    startDay > 0
      ? eachDayOfInterval({
          start: new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            monthStart.getDate() - startDay
          ),
          end: new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            monthStart.getDate() - 1
          ),
        })
      : [];

  // Navigation handlers
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt; Previous</button>
        <h2>{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={nextMonth}>Next &gt;</button>
        <button onClick={goToToday}>Today</button>
      </div>

      <div className="day-names">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {/* Previous month days (faded) */}
        {prevMonthDays.map((day) => (
          <DayTile
            key={day.toString()}
            day={day}
            isCurrentMonth={false}
            mood={moods.find((m) => isSameDay(new Date(m.date), day))}
            onClick={() => onDayClick(day)}
          />
        ))}

        {/* Current month days */}
        {monthDays.map((day) => (
          <DayTile
            key={day.toString()}
            day={day}
            isCurrentMonth={true}
            mood={moods.find((m) => isSameDay(new Date(m.date), day))}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
};

export default Calendar;
