// src/components/HowDoPanel.tsx
import React from "react";

interface Properties {
  children: React.ReactNode;
  isVisible: boolean;
}

const HowDoPanel: React.FC<Properties> = ({ children, isVisible }) => {
  return (
    <div className={`how-to-panel ${isVisible ? "visible" : ""}`}>
      {children}
    </div>
  );
};

export default HowDoPanel;
