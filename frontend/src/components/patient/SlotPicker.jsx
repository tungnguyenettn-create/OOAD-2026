import { SLOTS } from "../../utils/patientConstants";
import { isPastSlot } from "../../utils/patientHelpers";

export default function SlotPicker({ date, value, bookedTimes, onChange }) {
  return (
    <div className="pt-slots">
      {SLOTS.map((time) => {
        const disabled = bookedTimes.has(time) || isPastSlot(date, time);
        return (
          <button
            key={time}
            type="button"
            className={`pt-slot ${value === time ? "on" : ""}`}
            disabled={disabled}
            aria-pressed={value === time}
            onClick={() => onChange(time)}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
