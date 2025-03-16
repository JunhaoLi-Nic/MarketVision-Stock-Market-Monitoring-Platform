import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/header.css';
import HamburgerButton from './Tool/HamburgerButton';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <div className="header">
            <div className="logo">
                <Link to="/" className="personal-1" onClick={closeMenu}>MarketVision</Link>
            </div>
            <HamburgerButton onClick={toggleMenu} isOpen={isOpen} />
            <nav className={`taskbaar ${isOpen ? 'open' : ''}`}>
                <Link 
                    to="/" 
                    className={`link ${location.pathname === '/' ? 'active' : ''}`} 
                    onClick={closeMenu}
                >
                    Stock Dashboard
                </Link>
                <Link 
                    to="/DailyTask" 
                    className={`link ${location.pathname === '/DailyTask' ? 'active' : ''}`} 
                    onClick={closeMenu}
                >
                    Daily Task
                </Link>
                <Link 
                    to="/ContactMe" 
                    className={`link ${location.pathname === '/ContactMe' ? 'active' : ''}`} 
                    onClick={closeMenu}
                >
                    Contact Me
                </Link>
            </nav>
            {isOpen && <div className="overlay" onClick={closeMenu} />}
        </div>
    );
};

export default Header;