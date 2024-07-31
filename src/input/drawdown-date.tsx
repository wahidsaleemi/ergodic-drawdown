import React, { useCallback, useMemo } from "react";

import { inputLabels } from "../content";
import handleEnterKey from "./enter";

// eslint-disable-next-line functional/no-mixed-types
interface IDrawdownDateInput {
  drawdownDate: number;
  setDrawdownDate: (value: React.SetStateAction<number>) => void;
  setLoading: (value: React.SetStateAction<boolean>) => void;
}

const DrawdownDateInput = ({
  drawdownDate,
  setDrawdownDate,
  setLoading,
}: IDrawdownDateInput): JSX.Element => {
  const handleDistroDate: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const date = new Date(event.target.value);
        const timestamp = Math.floor(date.getTime());
        if (timestamp < Date.now()) {
          setDrawdownDate(Date.now());
        } else {
          setDrawdownDate(timestamp);
        }
        setLoading(true);
      },
      [setDrawdownDate, setLoading],
    );

  const value = useMemo(
    () => new Date(drawdownDate).toISOString().split("T")[0],
    [drawdownDate],
  );

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="input-row">
      <label htmlFor="distroDate">{inputLabels.drawdownDate}</label>
      <input
        autoComplete="off"
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
