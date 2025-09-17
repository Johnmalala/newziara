import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  ariaLabel?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled, ariaLabel }) => {
  return (
    <div
      className={`flex w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        enabled ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'
      }`}
      onClick={() => setEnabled(!enabled)}
      aria-label={ariaLabel}
      role="switch"
      aria-checked={enabled}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      />
    </div>
  );
};

export default ToggleSwitch;
