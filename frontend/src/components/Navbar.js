import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-uppercase" to="/">Product Hub</Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/">Products</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/add-product">Add Product</Link>
            </li>
          </ul>
        </div>

        <div className="ms-auto text-end text-light small">
          <span className="fw-bold">ELL887 - Assignment 2</span><br />
          <span>Shubham Chandra</span><br />
          <span>Entry No: 2024EET2396</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
