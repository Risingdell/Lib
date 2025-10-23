import React from 'react';
import './BookLoader.css';

const BookLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="book-loader-container">
      <div className="book-loader">
        <svg
          width="120"
          height="100"
          viewBox="0 0 120 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Book spine */}
          <rect
            x="55"
            y="20"
            width="10"
            height="60"
            fill="#2d3748"
            className="book-spine"
          />

          {/* Left cover */}
          <rect
            x="25"
            y="20"
            width="30"
            height="60"
            fill="#4a5568"
            rx="2"
            className="book-cover-left"
          />

          {/* Right cover */}
          <rect
            x="65"
            y="20"
            width="30"
            height="60"
            fill="#4a5568"
            rx="2"
            className="book-cover-right"
          />

          {/* Page 1 - flips first */}
          <g className="page page-1">
            <rect
              x="55"
              y="22"
              width="35"
              height="56"
              fill="#f7fafc"
              stroke="#cbd5e0"
              strokeWidth="0.5"
              rx="1"
            />
            <line x1="60" y1="30" x2="85" y2="30" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="60" y1="35" x2="85" y2="35" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="60" y1="40" x2="85" y2="40" stroke="#e2e8f0" strokeWidth="1" />
          </g>

          {/* Page 2 - flips second */}
          <g className="page page-2">
            <rect
              x="55"
              y="22"
              width="35"
              height="56"
              fill="#ffffff"
              stroke="#cbd5e0"
              strokeWidth="0.5"
              rx="1"
            />
            <line x1="60" y1="32" x2="85" y2="32" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="60" y1="37" x2="85" y2="37" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="60" y1="42" x2="85" y2="42" stroke="#e2e8f0" strokeWidth="1" />
          </g>

          {/* Page 3 - flips third */}
          <g className="page page-3">
            <rect
              x="55"
              y="22"
              width="35"
              height="56"
              fill="#f7fafc"
              stroke="#cbd5e0"
              strokeWidth="0.5"
              rx="1"
            />
            <line x1="60" y1="34" x2="85" y2="34" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="60" y1="39" x2="85" y2="39" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="60" y1="44" x2="85" y2="44" stroke="#e2e8f0" strokeWidth="1" />
          </g>
        </svg>
      </div>
      <p className="book-loader-message">{message}</p>
    </div>
  );
};

export default BookLoader;
