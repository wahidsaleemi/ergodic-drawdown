import React, { useCallback, useMemo } from "react";

import { inputLabels } from "../content";
import handleEnterKey from "./enter";

// eslint-disable-next-line functional/no-mixed-types
interface IDrawdownDateInput {
  drawdownDate: number;
  now?: number;
  setDrawdownDate: (value: React.SetStateAction<number>) => void;
  setLoading: (value: React.SetStateAction<boolean>) => void;
}

const DrawdownDateInput = ({
  drawdownDate,
  now,
  setDrawdownDate,
  setLoading,
}: IDrawdownDateInput): JSX.Element => {
  const handleDistroDate: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const date = new Date(event.target.value);
        const timestamp = Math.floor(date.getTime());
        if (now !== undefined && timestamp < now) {
          setDrawdownDate(now + 1_000_000);
        } else {
          setDrawdownDate(timestamp);
        }
        setLoading(true);
      },
      [now, setDrawdownDate, setLoading],
    );

  const value = useMemo(
    () => new Date(drawdownDate).toISOString().split("T")[0],
    [drawdownDate],
  );

  const minDate = useMemo(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toISOString().split("T")[0];
  }, []);

  return (
    <div className="input-row">
      <label htmlFor="distroDate">{inputLabels.drawdownDate}</label>
      <input
        autoComplete="off"
        className="input-date"
        id="distroDate"
        min={minDate}
        onChange={handleDistroDate}
        onKeyDown={handleEnterKey}
        type="date"
        value={value}
      />
    </div>
  );
};

export default DrawdownDateInput;
