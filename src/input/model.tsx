import React, { useCallback } from "react";

import { modelMap, models } from "../models";
import handleEnterKey from "./enter";

// eslint-disable-next-line functional/no-mixed-types
interface IModelInput {
  model: string;
  setLoading: (value: React.SetStateAction<boolean>) => void;
  setModel: (value: React.SetStateAction<string>) => void;
  setVariable: (value: React.SetStateAction<number>) => void;
  variable: number;
}

const ModelInput = ({
  model,
  setLoading,
  setModel,
  setVariable,
  variable,
}: IModelInput): JSX.Element => {
  const handleModel: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      if (model !== event.target.value) {
        setLoading(true);
        setModel(event.target.value);

        if (modelMap[event.target.value].varInput !== "") {
          setVariable(modelMap[event.target.value].default);
        }
      }
    },
    [model, setLoading, setModel, setVariable],
  );

  const handleVariable: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const value = Number.parseFloat(event.target.value);
        setVariable(value);
        setLoading(true);
      },
      [setLoading, setVariable],
    );

  const hasInput = modelMap[model].varInput !== "";

  return (
    <div className="input-row">
      <select
        className="select-model"
        id="modelInput"
        onChange={handleModel}
        onKeyDown={handleEnterKey}
        value={model}
      >
        {models.map((item) => (
          <option key={item.modelType} value={item.modelType}>
            {item.modelType}
          </option>
        ))}
      </select>
      {hasInput && (
        <>
          <label htmlFor="modelVariable">{modelMap[model].varInput}</label>
          <input
            autoComplete="off"
            className="input-number"
            id="modelVariable"
            onChange={handleVariable}
            onKeyDown={handleEnterKey}
            step="1"
            type="number"
            value={variable}
          />
        </>
      )}
    </div>
  );
};

export default ModelInput;
