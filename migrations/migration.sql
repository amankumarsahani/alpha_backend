-- To use this migration:
-- Create your database first:

-- - CREATE DATABASE IF NOT EXISTS alpha_d;
-- USE alpha_d;

-- - Then run the migration:
-- mysql -u your_username -p alpha_d < migrations/migration.sql

-- Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('draft', 'scheduled', 'sending', 'completed') DEFAULT 'draft',
    scheduled_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Campaign recipients tracking
CREATE TABLE campaign_recipients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT,
    customer_id INT,
    status ENUM('pending', 'sent', 'failed', 'opened') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Email templates table (optional, for reusable templates)
CREATE TABLE email_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Campaign analytics table (optional, for detailed tracking)
CREATE TABLE campaign_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT,
    recipient_id INT,
    event_type ENUM('open', 'click', 'bounce', 'spam_report') NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    link_clicked VARCHAR(255),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_campaign_status ON campaigns(status);
CREATE INDEX idx_recipient_status ON campaign_recipients(status);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_campaign_scheduled ON campaigns(scheduled_time);

-- Down Migration (if needed to rollback)
-- DROP TABLE IF EXISTS campaign_analytics;
-- DROP TABLE IF EXISTS email_templates;
-- DROP TABLE IF EXISTS campaign_recipients;
-- DROP TABLE IF EXISTS campaigns;
-- DROP TABLE IF EXISTS customers; 