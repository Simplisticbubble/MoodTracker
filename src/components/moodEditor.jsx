import React, { useState } from "react";
import { format } from "date-fns";

const MoodEditor = ({ date, mood, onSave, onClose }) => {
  const [rating, setRating] = useState(mood?.mood || 3);
  const [notes, setNotes] = useState(mood?.note || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      date,
      mood: rating,
      note: notes,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h3>{format(date, "MMMM d, yyyy")}</h3>

        <form onSubmit={handleSubmit}>
          <div className="mood-rating">
            <label>How was your day?</label>
            <div className="rating-options">
              {["1", "2", "3", "4", "5"].map((num) => (
                <label
                  key={num}
                  className={`rating-option ${
                    rating === num ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="moodRating"
                    value={num}
                    checked={rating === num}
                    onChange={() => setRating(num)}
                    className="visually-hidden"
                  />
                  <span className="emoji">
                    {["😢", "🙁", "😐", "🙂", "😁"][num - 1]}
                  </span>
                  <span className="label-text">
                    {
                      ["Very Bad", "Bad", "Neutral", "Good", "Very Good"][
                        num - 1
                      ]
                    }
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mood-notes">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made you feel this way?"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="secondary">
              Cancel
            </button>
            <button type="submit" className="primary">
              Save Mood
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoodEditor;
