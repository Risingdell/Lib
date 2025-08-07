import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    // Three.js animation setup
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a simple animated background
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system for background animation
    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleStudentClick = () => {
    navigate('/register');
  };

  const handleAdminClick = () => {
    navigate('/admin-login');
  };

  return (
    <div className="home-page">
      <canvas ref={canvasRef} className="background-canvas"></canvas>

      <div className="welcome-text">
        <pre>    Welcome,
          to the
                "Library Management System"</pre>
      </div>

      <div className="home-container">
        <h1>Welcome to the Library Management System</h1>
        <p>Choose your role to continue</p>

        <div className="button-container">
          <button className="btn student-btn" onClick={handleStudentClick}>
            <span className="btn-icon">👨‍🎓</span>
            <span className="btn-text">Student</span>
          </button>

          <button className="btn admin-btn" onClick={handleAdminClick}>
            <span className="btn-icon">👨‍💼</span>
            <span className="btn-text">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;