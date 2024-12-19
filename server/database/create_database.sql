CREATE DATABASE InventorySystem;
USE InventorySystem;



CREATE TABLE ItemType (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
)

CREATE TABLE Item (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(250),
    typeID INTEGER REFERENCES ItemType.ID
);

CREATE TABLE ItemNote (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    itemID INTEGER REFERENCES Item.ID,
    title VARCHAR(50),
    description VARCHAR(250)
);

CREATE TABLE ItemPrice (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    itemID INTEGER REFERENCES Item.ID,
    amount DOUBLE,
    currency VARCHAR(3),
    date DATETIME
);

CREATE TABLE UploadedDocument (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(128) UNIQUE,
    title VARCHAR(50),
    description VARCHAR(250)
);

CREATE TABLE ItemUploadedDocuments (
    itemID INTEGER REFERENCES Item.ID,
    documentID INTEGER REFERENCES UploadedDocument.ID,
    CONSTRAINT ID PRIMARY KEY (itemID,documentID)
);


CREATE TABLE Warehouse (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(250)
);

CREATE TABLE Transaction (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    date DATETIME,
    type ENUM('issue','receipt','relocation'),
    description VARCHAR(250),
    origin VARCHAR(50)
);

CREATE TABLE ItemMovement (
    txID INTEGER REFERENCES Transaction.ID,
    itemID INTEGER REFERENCES Item.ID,
    whID INTEGER REFERENCES Warehouse.ID,
    amount DOUBLE,
    UoM VARCHAR(10)
);


CREATE TABLE User (
    ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    isAdmin BOOLEAN DEFAULT false
);