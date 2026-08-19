# Online Examination System with Proctoring

A full-stack **Online Examination System with Proctoring** developed using the MERN stack. The system enables administrators to create and manage examinations while allowing students to securely attend online exams with time restrictions and proctoring mechanisms.

## Features

### Admin

* Secure admin authentication
* Create and manage examinations
* Set exam duration
* Add questions and multiple-choice options
* Update and manage exam details
* View examination results
* Monitor student exam violations

### Student

* Student registration and login
* Secure JWT-based authentication
* View available examinations
* Start an examination
* Answer multiple-choice questions
* Countdown timer during examination
* Submit examination
* View examination results
* Proctoring during the examination

### Proctoring

* Detects examination violations
* Detects tab switching during an examination
* Records violation events
* Prevents unauthorized examination access
* Associates violations with the student's examination attempt

## Technologies Used

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Bootstrap

### Backend

* Node.js
* Express.js
* REST API

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Token (JWT)
* bcryptjs
* Role-based authorization

### Development Tools

* Visual Studio Code
* Postman
* Git
* GitHub

## System Architecture

```text
                    ┌──────────────────────┐
                    │      React.js        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │     Express.js       │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │       MongoDB         │
                    │       Database        │
                    └──────────────────────┘

                    Authentication
                           │
                           ▼
                    JWT + bcryptjs

                    Proctoring
                           │
                           ▼
              Violation Detection & Logging
```

## Project Structure

```text
Online-Examination-System/
│
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Exam.js
│   │   ├── Question.js
│   │   └── Result.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── examRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
└── README.md
```

> The exact folder names may differ depending on your current project structure.

## Authentication Flow

```text
User
 │
 ▼
Login
 │
 ▼
Backend validates credentials
 │
 ├── bcryptjs → Password verification
 │
 ▼
JWT Token Generated
 │
 ▼
Token sent to Client
 │
 ▼
Protected API Request
 │
 ▼
JWT Verification Middleware
 │
 ▼
Role Authorization
 │
 ▼
Access Granted
```

## Examination Flow

```text
Student Login
      │
      ▼
View Available Exams
      │
      ▼
Select Exam
      │
      ▼
Start Exam
      │
      ▼
Proctoring Activated
      │
      ▼
Answer Questions
      │
      ├──── Tab Switch ────► Violation Recorded
      │
      ▼
Timer Ends / Submit
      │
      ▼
Evaluate Answers
      │
      ▼
Store Result
      │
      ▼
Display Result
```

## Testing

The backend APIs can be tested using **Postman**.

The main testing areas include:

* User registration
* User login
* JWT authentication
* Exam creation
* Question creation
* Exam starting
* Question retrieval
* Exam submission
* Result generation
* Proctoring violation recording
* Role-based access control

## Security

The application implements several security mechanisms:

* Password hashing using bcryptjs
* JWT-based authentication
* Protected API routes
* Role-based authorization
* Authentication middleware
* Exam access control
* Proctoring violation tracking

## Future Enhancements

The system can be extended with additional advanced proctoring capabilities:

* Webcam-based face detection
* Face recognition
* Multiple-person detection
* Object detection for prohibited devices
* Full-screen enforcement
* Microphone monitoring
* AI-based suspicious behavior detection
* Automated proctoring reports
* Email notifications
* Cloud deployment
* Detailed analytics dashboard

## Project Objective

The main objective of this project is to provide a **secure, scalable, and user-friendly online examination platform** that reduces manual examination management and improves examination integrity through automated proctoring mechanisms.

## Author

**Karthikeyan B**

GitHub: https://github.com/karthi07-com

LinkedIn: https://www.linkedin.com/in/kaarthikeyan-b-aba450227

## License

This project is developed for educational and academic purposes.
