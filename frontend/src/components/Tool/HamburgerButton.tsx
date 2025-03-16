import React from 'react';
import '../../css/HamburgerButton.css';

interface HamburgerButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ onClick, isOpen }) => {
    return (
        <button 
            className={`hamburger-button ${isOpen ? 'open' : ''}`} 
            onClick={onClick}
            aria-label="Toggle menu"
        >
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
        </button>
    );
};

export default HamburgerButton;