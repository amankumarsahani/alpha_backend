CREATE TABLE companies (
  CompanyID int NOT NULL AUTO_INCREMENT,
  CompanyName varchar(255) NOT NULL,
  Address text,
  Phone varchar(20) DEFAULT NULL,
  Website varchar(255) DEFAULT NULL,
  CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (CompanyID),
  UNIQUE KEY CompanyName (CompanyName)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
  UserID int NOT NULL AUTO_INCREMENT,
  CompanyID int DEFAULT NULL,
  Username varchar(255) NOT NULL,
  Email varchar(255) NOT NULL,
  PasswordHash varchar(255) NOT NULL,
  CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (UserID),
  UNIQUE KEY Username (Username),
  UNIQUE KEY Email (Email),
  KEY CompanyID (CompanyID),
  CONSTRAINT users_ibfk_1 FOREIGN KEY (CompanyID) REFERENCES companies (CompanyID)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE emailcampaigns (
  CampaignID int NOT NULL AUTO_INCREMENT,
  CompanyID int DEFAULT NULL,
  UserID int DEFAULT NULL,
  CampaignName varchar(255) NOT NULL,
  Subject varchar(255) NOT NULL,
  Content text NOT NULL,
  CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  ScheduledFor timestamp NULL DEFAULT NULL,
  PRIMARY KEY (CampaignID),
  KEY CompanyID (CompanyID),
  KEY UserID (UserID),
  CONSTRAINT emailcampaigns_ibfk_1 FOREIGN KEY (CompanyID) REFERENCES companies (CompanyID),
  CONSTRAINT emailcampaigns_ibfk_2 FOREIGN KEY (UserID) REFERENCES users (UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE campaignstatistics (
  StatID int NOT NULL AUTO_INCREMENT,
  CampaignID int DEFAULT NULL,
  EmailsSent int DEFAULT '0',
  EmailsOpened int DEFAULT '0',
  Clicks int DEFAULT '0',
  Unsubscribes int DEFAULT '0',
  Bounces int DEFAULT '0',
  CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (StatID),
  KEY CampaignID (CampaignID),
  CONSTRAINT campaignstatistics_ibfk_1 FOREIGN KEY (CampaignID) REFERENCES emailcampaigns (CampaignID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE emailrecipients (
  RecipientID int NOT NULL AUTO_INCREMENT,
  CompanyID int DEFAULT NULL,
  Email varchar(255) NOT NULL,
  FirstName varchar(255) DEFAULT NULL,
  LastName varchar(255) DEFAULT NULL,
  CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (RecipientID),
  KEY CompanyID (CompanyID),
  CONSTRAINT emailrecipients_ibfk_1 FOREIGN KEY (CompanyID) REFERENCES companies (CompanyID)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE emailssent (
  EmailID int NOT NULL AUTO_INCREMENT,
  CampaignID int DEFAULT NULL,
  RecipientID int DEFAULT NULL,
  SentAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  Status enum('Sent','Failed') DEFAULT 'Sent',
  PRIMARY KEY (EmailID),
  KEY CampaignID (CampaignID),
  KEY RecipientID (RecipientID),
  CONSTRAINT emailssent_ibfk_1 FOREIGN KEY (CampaignID) REFERENCES emailcampaigns (CampaignID),
  CONSTRAINT emailssent_ibfk_2 FOREIGN KEY (RecipientID) REFERENCES emailrecipients (RecipientID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE emailtemplates (
  TemplateID int NOT NULL AUTO_INCREMENT,
  CompanyID int DEFAULT NULL,
  UserID int DEFAULT NULL,
  TemplateName varchar(255) NOT NULL,
  Subject varchar(255) NOT NULL,
  Content text NOT NULL,
  CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (TemplateID),
  KEY CompanyID (CompanyID),
  KEY UserID (UserID),
  CONSTRAINT emailtemplates_ibfk_1 FOREIGN KEY (CompanyID) REFERENCES companies (CompanyID),
  CONSTRAINT emailtemplates_ibfk_2 FOREIGN KEY (UserID) REFERENCES users (UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    CreatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP
);
