import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const features = [
    {
      icon: '📅',
      title: 'Attendance',
      desc: 'Automated tracking for students and staff with real-time notification to parents.',
      color: '#2563eb',
    },
    {
      icon: '💰',
      title: 'Fee Management',
      desc: 'Integrated payment gateway, automated invoicing, and detailed financial reporting.',
      color: '#7c3aed',
    },
    {
      icon: '⏰',
      title: 'Timetable',
      desc: 'Smart scheduling engine that prevents conflicts and optimizes resource allocation.',
      color: '#06b6d4',
    },
    {
      icon: '📝',
      title: 'Exams & Results',
      desc: 'Comprehensive exam planning, grading, and digital report card generation.',
      color: '#f59e0b',
    },
    {
      icon: '🚌',
      title: 'Transport',
      desc: 'Real-time GPS tracking for buses and route optimization for safety and efficiency.',
      color: '#10b981',
    },
    {
      icon: '💬',
      title: 'Communication',
      desc: 'Centralized portal for messages, announcements, and parent-teacher meetings.',
      color: '#ec4899',
    },
  ];

  const roles = [
    {
      title: 'Super Admin & Principal',
      desc: 'Full operational control and high-level analytics for institutional growth.',
      icon: '🏛️',
    },
    {
      title: 'Teachers',
      desc: 'Reduce paperwork and focus on teaching with easy grade and attendance management.',
      icon: '👩‍🏫',
    },
    {
      title: 'Parents & Students',
      desc: 'Stay updated with real-time academic progress and fee alerts via mobile app.',
      icon: '👨‍👩‍👧',
    },
  ];

  const stats = [
    { value: '2,500+', label: 'Schools' },
    { value: '50,000+', label: 'Students' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  const glassStats = [
    { value: '9', label: 'User Roles' },
    { value: '25+', label: 'Modules' },
    { value: '100%', label: 'Secure' },
    { value: 'LIVE', label: 'Updates' },
  ];

  return (
    <div className="landing-page">
      {/* ── NAVBAR ── */}
      <nav className="landing-navbar" id="landing-nav">
        <Link to="/" className="landing-logo">EduCore ERP</Link>
        <div className="landing-nav-links">
          <a href="#features" className="nav-link-text">Features</a>
          <a href="#roles" className="nav-link-text">Solutions</a>
          <Link to="/login" className="login-btn">Log In</Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <motion.section
        className="hero-section"
        id="hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-bg-shape" />
        <div className="hero-bg-shape-2" />

        <div className="hero-content">
          <motion.div variants={itemVariants} className="hero-badge">
            ✨ The Future of School Management
          </motion.div>

          <motion.h1 variants={itemVariants} className="hero-title">
            Unified K-12 School<br />
            <span>Management</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-subtitle">
            Simplify administration, enhance learning, and connect your entire
            school community in one powerful platform.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-cta-group">
            <Link to="/login" className="cta-primary">Get Started</Link>
            <a href="#features" className="cta-secondary">Learn More</a>
          </motion.div>
        </div>

        {/* Floating Glass Stats */}
        <motion.div
          className="floating-stat floating-stat--left"
          variants={scaleIn}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="floating-stat__label">Active Schools</span>
          <span className="floating-stat__value">2,500+</span>
        </motion.div>

        <motion.div
          className="floating-stat floating-stat--right"
          variants={scaleIn}
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <span className="floating-stat__label">Uptime Guarantee</span>
          <span className="floating-stat__value">99.9%</span>
        </motion.div>

        <motion.div
          className="floating-stat floating-stat--bottom"
          variants={scaleIn}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <span className="floating-stat__label">Total Students</span>
          <span className="floating-stat__value">50K+</span>
        </motion.div>
      </motion.section>

      {/* ── FEATURES SECTION ── */}
      <motion.section
        className="features-section"
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <div className="section-header">
          <motion.h2 variants={fadeInUp} className="section-title">Everything You Need</motion.h2>
          <motion.p variants={fadeInUp} className="section-subtitle">
            A comprehensive suite of tools designed to manage every aspect of your educational institution.
          </motion.p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              className="feature-card"
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <div
                className="feature-icon-wrapper"
                style={{ background: `${feat.color}15`, color: feat.color }}
              >
                <span className="feature-icon-emoji">{feat.icon}</span>
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── ROLES SECTION ── */}
      <motion.section
        className="roles-section"
        id="roles"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <div className="roles-container">
          <motion.div className="roles-content" variants={fadeInUp}>
            <h2>Built for Everyone</h2>
            <div className="roles-list">
              {roles.map((role, idx) => (
                <motion.div
                  key={idx}
                  className="role-item"
                  variants={fadeInUp}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                >
                  <span className="role-icon">{role.icon}</span>
                  <div>
                    <h3>{role.title}</h3>
                    <p>{role.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="roles-image" variants={scaleIn}>
            <div className="glass-card">
              {glassStats.map((stat, idx) => (
                <div key={idx} className="glass-stat">
                  <span className="glass-stat-value">{stat.value}</span>
                  <span className="glass-stat-label">{stat.label}</span>
                </div>
              ))}
              <div className="glass-trust-badge">
                Trusted by 10k+ educators
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── STATS / SOCIAL PROOF SECTION ── */}
      <motion.section
        className="stats-section"
        id="stats"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={containerVariants}
      >
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <motion.div key={idx} className="stat-item" variants={fadeInUp}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA SECTION ── */}
      <motion.section
        className="cta-section"
        id="cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={containerVariants}
      >
        <motion.h2 variants={fadeInUp} className="cta-title">
          Ready to transform your school?
        </motion.h2>
        <motion.p variants={fadeInUp} className="cta-subtitle">
          Join thousands of progressive institutions using EduCore to streamline
          their operations and empower their students.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Link to="/login" className="cta-button-glow">Get Started Today</Link>
        </motion.div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer" id="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">EduCore ERP</div>
            <p className="footer-desc">
              Precision for Modern Education. The most advanced school ERP
              platform built for K-12 institutions.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#roles">Solutions</a>
              <a href="#">Security</a>
              <a href="#">Updates</a>
            </div>
            <div className="link-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Testimonials</a>
              <a href="#">Contact</a>
              <a href="#">Blog</a>
            </div>
            <div className="link-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">API Reference</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EduCore ERP. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
