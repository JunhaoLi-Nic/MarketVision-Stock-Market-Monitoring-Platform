import React from 'react';
import '../../css/hamburgerButton.css';

// Define a type for the props expected by the HamburgerButton component
type HamburgerButtonProps = {
  onClick: () => void;  // Specify that onClick is a function that returns void
};

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ onClick }) => (
  <button className="hamburger" onClick={onClick} aria-label="☰">
    ☰
  </button>
);

export default HamburgerButton;