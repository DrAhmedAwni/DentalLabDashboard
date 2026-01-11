import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, DollarSign, Package, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import '../styles/layout.css';

import logo from '../assets/logo.png';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="layout-container">
            {/* Mobile Menu Toggle Button */}
            <button
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />

            <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logo} alt="DentalMed" className="logo-image" />
                </div>

                <nav className="sidebar-nav">
                    <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/cases" className={`nav-item ${isActive('/cases') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <FolderKanban size={20} />
                        <span>Cases</span>
                    </Link>
                    <Link to="/finance" className={`nav-item ${isActive('/finance') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <DollarSign size={20} />
                        <span>Finance</span>
                    </Link>
                    <Link to="/inventory" className={`nav-item ${isActive('/inventory') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Package size={20} />
                        <span>Inventory</span>
                    </Link>
                    <Link to="/doctors" className={`nav-item ${isActive('/doctors') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Users size={20} />
                        <span>Doctors</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item">
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button className="nav-item">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <h2 className="page-title">
                        {location.pathname === '/' ? 'Dashboard' :
                            location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.slice(2)}
                    </h2>

                    <div className="search-bar">
                        <input type="text" placeholder="Search type of keywords" />
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>

                    <div className="user-profile">
                        <div className="notification-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </div>
                        <div className="avatar">JD</div>
                        <div className="user-info">
                            <span className="username">Dr. Anjan Tuladhar</span>
                            <span className="user-role">Admin</span>
                        </div>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
