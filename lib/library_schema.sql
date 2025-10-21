-- Library Management System - Database Schema
-- Exported: 2025-10-21T11:15:22.297Z
-- Database: library

CREATE DATABASE IF NOT EXISTS library;
USE library;

-- Table: admins
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: book_requests
DROP TABLE IF EXISTS `book_requests`;
CREATE TABLE `book_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `marketplace_book_id` int(11) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `requested_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','cancelled','completed') DEFAULT 'active',
  `is_priority_buyer` tinyint(1) DEFAULT 0 COMMENT 'TRUE if this is the current active/first buyer in queue',
  `cancelled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_marketplace_book` (`marketplace_book_id`),
  KEY `idx_requester` (`requester_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`is_priority_buyer`),
  KEY `idx_requested_at` (`requested_at`),
  CONSTRAINT `book_requests_ibfk_1` FOREIGN KEY (`marketplace_book_id`) REFERENCES `used_books_marketplace` (`id`) ON DELETE CASCADE,
  CONSTRAINT `book_requests_ibfk_2` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks all buyer requests for marketplace books with queue management';

-- Table: books
DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sl_no` int(11) NOT NULL,
  `acc_no` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `donated_by` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'available',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: borrowed_books
DROP TABLE IF EXISTS `borrowed_books`;
CREATE TABLE `borrowed_books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `borrow_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `returned_at` datetime DEFAULT NULL,
  `return_status` enum('active','pending_return','approved','rejected') DEFAULT 'active' COMMENT 'active=borrowed, pending_return=waiting approval, approved=return approved, rejected=return rejected',
  `approved_by` int(11) DEFAULT NULL COMMENT 'Admin who approved/rejected the return',
  `approved_at` datetime DEFAULT NULL COMMENT 'Timestamp when return was approved/rejected',
  `rejection_reason` text DEFAULT NULL COMMENT 'Reason if return was rejected',
  `status` varchar(50) DEFAULT 'borrowed',
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `fk_borrowed_books_approved_by` (`approved_by`),
  KEY `idx_return_status` (`return_status`),
  KEY `idx_user_status` (`user_id`,`return_status`),
  CONSTRAINT `borrowed_books_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `borrowed_books_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_borrowed_books_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: selling_books
DROP TABLE IF EXISTS `selling_books`;
CREATE TABLE `selling_books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_no` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `buyer_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'available',
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `selling_books_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `selling_books_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: used_books_marketplace
DROP TABLE IF EXISTS `used_books_marketplace`;
CREATE TABLE `used_books_marketplace` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_no` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `buyer_id` int(11) DEFAULT NULL,
  `status` enum('available','requested','sold','completed') DEFAULT 'available',
  `requested_at` datetime DEFAULT NULL COMMENT 'When first request was made (priority buyer timestamp)',
  `received_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `active_requester_id` int(11) DEFAULT NULL COMMENT 'Current priority buyer (first in queue)',
  `sold_at` datetime DEFAULT NULL COMMENT 'When seller marked as sold',
  `completed_at` datetime DEFAULT NULL COMMENT 'When transaction fully completed (both sold and received)',
  `total_requests` int(11) DEFAULT 0 COMMENT 'Count of active requests',
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `requested_by` (`requested_by`),
  KEY `buyer_id` (`buyer_id`),
  KEY `idx_active_requester` (`active_requester_id`),
  KEY `idx_status_enhanced` (`status`),
  CONSTRAINT `fk_active_requester` FOREIGN KEY (`active_requester_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `used_books_marketplace_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `used_books_marketplace_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `used_books_marketplace_ibfk_3` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `usn` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_image` varchar(500) DEFAULT NULL COMMENT 'URL or path to user profile image',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `usn` (`usn`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

