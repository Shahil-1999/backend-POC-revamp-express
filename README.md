# RUN the programme
step 1 - npm install
step 2 - make your .env file (.env.example file provided)
stem 3 - create database in your workbench or dbever etc
step 5 - npm run migrate:up
step 6 - npm start



# Backend-POC (Express.js + sequelize + AWS S3)

This is a backend proof of concept (POC) built with **Express.js**, **Sequelize**, **MySQL**, and **AWS S3** for file handling. The project is structured to support scalable development, clean API architecture, secure user authentication, and file upload functionality.

---

## 📁 Features

- ⚙️ **Express.js** server framework
- 🔐 JWT-based authentication
- 📦 Sequelize ORM with MySQL
- ☁️ AWS S3 for secure file uploads
- ✅ ESLint + Husky for code quality
- 🚫 Soft delete functionality
- 🧠 Modular folder structure

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **Sequelize ORM**
- **MySQL**
- **AWS S3**
- **JWT**
- **ESLint** + **Husky**

---
## About Project
- Uploading Images to S3
    A single image per user is stored. If a user uploads a new image, the old image is overwritten in the bucket (e.g. profile-1.jpg). Metadata in DB is updated accordingly.

- Linting & Husky
    ESLint v9 is configured with eslint.config.js. Husky runs lint checks before every commit
---

## 📂 Project Structure
```bash
backend-POC/
├── common/            -- common function
├── config/            -- database config
├── connection/        -- database connection
├── constant/          -- constant variables
├── controllers/       -- Route handlers
├── middlewares/       -- Auth & validation
├── models/            -- sequelize model
├── routes/            -- Express route definitions
├── migration/         -- sequelize migration
├── helper/            -- Utility functions (e.g., AWS S3)
├── validations/       -- Joi schemas
├── .env               -- Environment config
├── app.js             -- Entry point
└── package.json
