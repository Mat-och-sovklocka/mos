import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useState } from "react";
import img1 from "./images/img1.png";
import img2 from "./images/img2.png";
import img3 from "./images/img3.png";
import img4 from "./images/img4.png";
import img5 from "./images/img5.png";
import img6 from "./images/img6.png";
import img7 from "./images/img7.png";
import img8 from "./images/img8.png";
import "./reminder.css";

const images = [img1, img2, img3, img4, img5, img6, img7, img8];
const labels = [
  "Måltider",
  "Medicinintag",
  "Rörelse/pauser",
  "Vila/sömn",
  "Möte",
  "Dusch",
  "Städning",
  "Övrigt",
];

function Reminders() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reminderType, setReminderType] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [timeSelected, setTimeSelected] = useState(false);

  const [selectedDays, setSelectedDays] = useState([]);
  const [repeatInterval, setRepeatInterval] = useState("1");

  // 👉 flera tider för återkommande påminnelser
  const [recurringTimes, setRecurringTimes] = useState([
    { hour: "08", minute: "00" },
  ]);

  const activeIndex = selected !== null ? selected : hovered;
  const activeLabel = activeIndex !== null ? labels[activeIndex] : "";

  const handleTimeSelect = (date) => {
    setSelectedDateTime(date);
    setTimeSelected(true);
  };

  const addRecurringTime = () => {
    setRecurringTimes([...recurringTimes, { hour: "08", minute: "00" }]);
  };

  const updateRecurringTime = (index, field, value) => {
    const newTimes = [...recurringTimes];
    newTimes[index][field] = value;
    setRecurringTimes(newTimes);
  };

  const removeRecurringTime = (index) => {
    setRecurringTimes(recurringTimes.filter((_, i) => i !== index));
  };

  const sendReminder = () => {
    const payload = {
      type: activeLabel,
      date: formatDate(selectedDateTime),
      time: formatTime(selectedDateTime),
    };

    console.log("Skickar till backend...", payload);

    setTimeout(() => {
      alert(
        `Påminnelse skickad:\n${payload.type} - ${payload.date} kl. ${payload.time}`
      );
      resetState();
    }, 1000);
  };

  const sendRecurringReminder = () => {
    const payload = {
      type: activeLabel,
      days: selectedDays,
      interval: repeatInterval,
      times: recurringTimes.map((t) => `${t.hour}:${t.minute}`),
    };

    console.log("Skickar återkommande påminnelse...", payload);

    alert(
      `Återkommande påminnelse skickad:\n${payload.type} - ${
        payload.days.join(", ") || "inga valda dagar"
      } kl. ${payload.times.join(", ")} (${
        repeatInterval === "monthly"
          ? "en gång i månaden"
          : `var ${repeatInterval}:e vecka`
      })`
    );

    resetState();
  };

  const resetState = () => {
    setSelectedDateTime(null);
    setTimeSelected(false);
    setSelected(null);
    setHovered(null);
    setReminderType(null);
    setShowCalendar(false);
    setSelectedDays([]);
    setRepeatInterval("1");
    setRecurringTimes([{ hour: "08", minute: "00" }]);
  };

  const handleClick = (type) => {
    setReminderType(type);
    setShowCalendar(type === "single");
    setSelectedDateTime(null);
    setTimeSelected(false);
  };

  const formatDate = (date) =>
    date?.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) =>
    date?.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="reminders-container container">
      <h1 className="h1 text-primary fw-bold text-center mb-4">Påminnelser</h1>

      <p className="lead text-muted text-center mb-5">
        För musmarkören över bilden för att se de olika typer av påminnelser.
        <br />
        Klicka sedan på den påminnelse du vill ställa.
      </p>

      {/* Bilder */}
      <div className="row">
        <div className="col-8 mx-auto">
          <div
            className="reminder-textfield bg-white mx-auto p-3 fw-bold text-primary text-center mb-4 fs-4"
            style={{ minHeight: "3rem" }}
          >
            {activeLabel ? (
              activeLabel
            ) : (
              <span style={{ visibility: "hidden" }}>placeholder</span>
            )}
          </div>
          <div className="row mb-4">
            {images.map((img, i) => (
              <div
                key={i}
                className="col-6 col-sm-4 col-md-3 d-flex justify-content-center"
              >
                <img
                  src={img}
                  alt={labels[i]}
                  className={`reminder-img ${
                    selected !== null
                      ? selected === i
                        ? "selected"
                        : "inactive"
                      : hovered === i
                      ? "hovered"
                      : ""
                  }`}
                  onMouseEnter={() => selected === null && setHovered(i)}
                  onMouseLeave={() => selected === null && setHovered(null)}
                  onClick={() => {
                    if (selected === null) setSelected(i);
                    else if (selected === i) resetState();
                  }}
                />
              </div>
            ))}
          </div>

          {/* Knappar */}
          {selected !== null && (
            <div className="row mb-4">
              <div className="col-6">
                <button
                  className="btn btn-primary w-100 fw "
                  onClick={() => handleClick("single")}
                >
                  Enstaka påminnelser
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-primary w-100 fw "
                  onClick={() => handleClick("recurring")}
                >
                  Återkommande påminnelser
                </button>
              </div>
            </div>
          )}

          {/* Enstaka påminnelser (en tid/datum) */}
          {showCalendar && (
            <div className="row">
              <div className="col-md-6">
                <DatePicker
                  selected={selectedDateTime}
                  onChange={(date) => handleTimeSelect(date)}
                  showTimeSelect
                  timeIntervals={5}
                  timeFormat="HH:mm"
                  dateFormat="Pp"
                  inline
                />
              </div>

              {timeSelected && (
                <div className="col-md-6 d-flex flex-column justify-content-start">
                  <div className="border border-success rounded p-3 mb-3 bg-light text-success fw-bold">
                    Vill du lägga en påminnelse för <u>{activeLabel}</u> den{" "}
                    <u>{formatDate(selectedDateTime)}</u> klockan{" "}
                    <u>{formatTime(selectedDateTime)}</u>?
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-success flex-fill fw-bold"
                      onClick={sendReminder}
                    >
                      OK
                    </button>
                    <button
                      className="btn btn-danger flex-fill fw-bold"
                      onClick={() => {
                        setSelectedDateTime(null);
                        setTimeSelected(false);
                      }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Återkommande påminnelse (flera tider) */}
          {reminderType === "recurring" && (
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Välj veckodagar:</label>
                <div className="btn-group mb-3" role="group">
                  {["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"].map(
                    (day) => (
                      <button
                        key={day}
                        type="button"
                        className={`btn btn-outline-primary ${
                          selectedDays?.includes(day) ? "active" : ""
                        }`}
                        onClick={() =>
                          setSelectedDays((prev) =>
                            prev?.includes(day)
                              ? prev.filter((d) => d !== day)
                              : [...(prev || []), day]
                          )
                        }
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>

                <label className="form-label">Repetitionsintervall:</label>
                <select
                  className="form-select mb-3"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(e.target.value)}
                >
                  <option value="1">Varje vecka</option>
                  <option value="2">Varannan vecka</option>
                  <option value="3">Var tredje vecka</option>
                  <option value="monthly">En gång i månaden</option>
                </select>

                <label className="form-label">Tider:</label>
                {recurringTimes.map((t, index) => (
                  <div
                    key={index}
                    className="d-flex gap-2 align-items-center mb-2"
                  >
                    <select
                      className="form-select"
                      value={t.hour}
                      onChange={(e) =>
                        updateRecurringTime(index, "hour", e.target.value)
                      }
                    >
                      {[...Array(24)].map((_, i) => {
                        const h = i.toString().padStart(2, "0");
                        return (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        );
                      })}
                    </select>
                    <span>:</span>
                    <select
                      className="form-select"
                      value={t.minute}
                      onChange={(e) =>
                        updateRecurringTime(index, "minute", e.target.value)
                      }
                    >
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
                        (m) => {
                          const min = m.toString().padStart(2, "0");
                          return (
                            <option key={min} value={min}>
                              {min}
                            </option>
                          );
                        }
                      )}
                    </select>

                    {index === 0 ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={addRecurringTime}
                      >
                        +
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeRecurringTime(index)}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="col-md-6 d-flex flex-column justify-content-start">
                <div className="border border-info rounded p-3 mb-3 bg-light text-info fw-bold">
                  Vill du lägga en återkommande påminnelse för{" "}
                  <u>{activeLabel}</u> på{" "}
                  <u>{selectedDays?.join(", ") || "inga valda dagar"}</u>{" "}
                  klockan{" "}
                  <u>
                    {recurringTimes.map((t) => `${t.hour}:${t.minute}`).join(
                      ", "
                    )}
                  </u>
                  ,{" "}
                  <u>
                    {repeatInterval === "monthly"
                      ? "en gång i månaden"
                      : `var ${repeatInterval}:e vecka`}
                  </u>
                  ?
                </div>

                <div className="d-flex gap-3">
                  <button
                    className="btn btn-success flex-fill fw-bold"
                    onClick={sendRecurringReminder}
                  >
                    OK
                  </button>
                  <button
                    className="btn btn-danger flex-fill fw-bold"
                    onClick={() => {
                      setSelectedDays([]);
                      setRepeatInterval("1");
                      setRecurringTimes([{ hour: "08", minute: "00" }]);
                    }}
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
