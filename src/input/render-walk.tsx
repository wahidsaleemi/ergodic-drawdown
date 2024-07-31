import React, { useCallback } from "react";

import { inputLabels } from "../content";
import handleEnterKey from "./enter";

// eslint-disable-next-line functional/no-mixed-types
interface IRenderWalk {
  renderWalk: boolean;
  setRenderWalk: (value: React.SetStateAction<boolean>) => void;
}

const RenderWalkInput = ({
  renderWalk,
  setRenderWalk,
}: IRenderWalk): JSX.Element => {
  const handleRenderWalk: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        setRenderWalk(event.target.checked);
      },
      [setRenderWalk],
    );

  return (
    <div className="input-row">
      <label htmlFor="renderWalk">{inputLabels.renderWalk}</label>
      <input
        autoComplete="off"
        checked={renderWalk}
        id="renderWalk"
        onChange={handleRenderWalk}
        onKeyDown={handleEnterKey}
        type="checkbox"
      />
    </div>
  );
};

export default RenderWalkInput;
