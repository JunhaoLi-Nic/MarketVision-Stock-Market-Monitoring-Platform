import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/header.css';
import HamburgerButton from './Tool/HamburgerButton';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="header">
            <div className="logo">
                <Link to="/" className="personal-1">Nic.</Link>
            </div>
            <HamburgerButton onClick={toggleMenu} />
            <div className={`taskbaar ${isOpen ? 'open' : ''}`}>
                <Link to="/aboutme" className="link">About me</Link>
                <Link to="/Resume" className="link">Daily Task</Link>
                <Link to="/projects" className="link">Stock Selection</Link>
                <Link to="/#contact" className="link">Contact Me</Link>
            </div>
        </div>
    );
};

export default Header;