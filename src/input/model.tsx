import React, { useCallback } from "react";

import { models } from "../models";
import handleEnterKey from "./enter";

// eslint-disable-next-line functional/no-mixed-types
interface IModelInput {
  model: string;
  setLoading: (value: React.SetStateAction<boolean>) => void;
  setModel: (value: React.SetStateAction<string>) => void;
}

const ModelInput = ({
  model,
  setLoading,
  setModel,
}: IModelInput): JSX.Element => {
  const handleModel: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      if (model !== event.target.value) {
        setLoading(true);
        setModel(event.target.value);
      }
    },
    [model, setLoading, setModel],
  );

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
    </div>
  );
};

export default ModelInput;
