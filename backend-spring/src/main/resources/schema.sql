-- CareerForge Relational Enterprise Database Definition
-- Target relational database system: MySQL v8.0+

CREATE DATABASE IF NOT EXISTS careerforge_db;
USE careerforge_db;

-- 1. Users Table Map
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- BCrypt encrypted password
    role ENUM('seeker', 'recruiter', 'admin') NOT NULL,
    plan ENUM('free', 'premium') DEFAULT 'free',
    premium_expires VARCHAR(50) NULL,
    blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Recruiter Company Vetting Profile
CREATE TABLE IF NOT EXISTS recruiter_profiles (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    website VARCHAR(255) NOT NULL,
    location VARCHAR(150) NOT NULL,
    approved BOOLEAN DEFAULT FALSE, -- Approved by Administrator moderate queue
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Job Seekers Profiles
CREATE TABLE IF NOT EXISTS seeker_profiles (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    title VARCHAR(150) NULL,
    bio TEXT NULL,
    location VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    resume_name VARCHAR(255) NULL,
    resume_mysql_path VARCHAR(512) NULL, -- Stores MultipartFile server file path
    github_url VARCHAR(255) NULL,
    linkedin_url VARCHAR(255) NULL,
    portfolio_url VARCHAR(255) NULL,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Job Positions Openings Table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    recruiter_id VARCHAR(50) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    salary_min INT NOT NULL,
    salary_max INT NOT NULL,
    job_type VARCHAR(100) NOT NULL, -- Full-time, Remote, etc.
    experience_level VARCHAR(100) NOT NULL, -- Senior, Junior, etc.
    status ENUM('active', 'closed', 'flagged') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Applications Pipeline Table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    seeker_id VARCHAR(50) NOT NULL,
    seeker_name VARCHAR(150) NOT NULL,
    seeker_email VARCHAR(100) NOT NULL,
    resume_name VARCHAR(255) NOT NULL,
    cover_letter TEXT NULL,
    status ENUM('Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected') DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seeker_app (seeker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Saved Positions Selection Table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    seeker_id VARCHAR(50) NOT NULL,
    job_id VARCHAR(50) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY uq_seeker_job (seeker_id, job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Audit Logging Table
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed statements
INSERT INTO users (id, email, full_name, password_hash, role) VALUES 
('user_seeker_1', 'seeker@jobportal.com', 'Rahul Sharma', '$2a$10$wN9F9Y6eM8e4vD7z/D/pSeH.qF3L6pZ.gR74Kx1tV5.Y1C1Z4V', 'seeker'),
('user_recruiter_1', 'hr@google.com', 'John Doe', '$2a$10$wN9F9Y6eM8e4vD7z/D/pSeH.qF3L6pZ.gR74Kx1tV5.Y1C1Z4V', 'recruiter'),
('user_admin_1', 'admin@jobportal.com', 'Chief Administrator', '$2a$10$wN9F9Y6eM8e4vD7z/D/pSeH.qF3L6pZ.gR74Kx1tV5.Y1C1Z4V', 'admin');
