// src/components/HowDoButton.tsx
import React from "react";

// eslint-disable-next-line functional/no-mixed-types
interface Properties {
  isVisible: boolean;
  offButtonText: string;
  onButtonText: string;
  onClick: () => void;
}

const HowToButton: React.FC<Properties> = ({
  isVisible,
  offButtonText,
  onButtonText,
  onClick,
}) => {
  const text = isVisible ? onButtonText : offButtonText;
  return (
    <button className="how-to-button" onClick={onClick} type="button">
      {text}
    </button>
  );
};

export default HowToButton;
