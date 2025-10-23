import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../Components/ThreeBackground';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStudentClick = () => {
    navigate('/register');
  };

  const handleAdminClick = () => {
    navigate('/admin-login');
  };

  return (
    <>
      <style>{`
        .home-center-card {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .home-card {
          background: rgba(30, 41, 59, 0.7);
          padding: 3rem 2.5rem;
          border-radius: 22px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          min-width: 340px;
          max-width: 95vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeInUp 1.2s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          z-index: 1;
        }
        .home-card h1 {
          font-size: 2.4rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.7rem;
          letter-spacing: 1px;
          text-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .home-card p {
          font-size: 1.15rem;
          color: #94a3b8;
          margin-bottom: 2.2rem;
          text-align: center;
        }
        .home-btn-group {
          display: flex;
          gap: 24px;
          width: 100%;
          justify-content: center;
        }
        .home-btn {
          min-width: 150px;
          padding: 16px 32px;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          background: #3b82f6;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .home-btn.student {
          background: #3b82f6;
        }
        .home-btn.admin {
          background: #2563eb;
        }
        .home-btn:hover, .home-btn:focus {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
          outline: none;
        }
        .home-btn .btn-icon {
          font-size: 1.5em;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 600px) {
          .home-card {
            min-width: 90vw;
            padding: 1.5rem 0.5rem;
          }
          .home-card h1 {
            font-size: 1.5rem;
          }
          .home-btn-group {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
      <ThreeBackground />
      <div className="home-center-card">
        <div className="home-card">
          <h1>Welcome to the AI & DS Library</h1>
          <p>Choose your role to continue:</p>
          <div className="home-btn-group">
            <button className="home-btn student" onClick={handleStudentClick}>
              <span className="btn-icon" role="img" aria-label="Student"></span>
              Student
            </button>
            <button className="home-btn admin" onClick={handleAdminClick}>
              <span className="btn-icon" role="img" aria-label="Admin"></span>
              Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
