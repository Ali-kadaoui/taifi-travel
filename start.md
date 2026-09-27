# 🌍 Taifi Travel - Full Project Documentation & Setup Guide

Welcome to the **Taifi Travel** project! This document serves as a full presentation of the system and a comprehensive guide on how to reinstall and start it from scratch. It is specifically designed so that if you come back to this project in the future, you will know exactly what to do.

---

## 1. 🏗️ Project Presentation (What is this?)

This project is a complete, multi-component travel management system. It consists of 4 main technical components:

1. **`taifi-travel-back` (The Brain/API)**
   - **Technology:** C# .NET
   - **Role:** This is the backend API. It handles all the business logic, connects to the SQLite database (`taifi.db`), and serves data to all the frontends and mobile apps.

2. **`taifi-travel-front` (The Dashboard/Main Web App)**
   - **Technology:** Node.js, Vite (React/Vue)
   - **Role:** This is the primary web application for the project. It's likely used as the admin dashboard or the core platform for managing travel operations.

3. **`website_new` (The Public Website)**
   - **Technology:** Node.js, Vite, Tailwind CSS
   - **Role:** This is the modern, public-facing landing page or website for Taifi Travel clients. 

4. **`taifi_scanner` (The Mobile App)**
   - **Technology:** Flutter (Dart)
   - **Role:** A cross-platform mobile application, likely designed for staff to scan tickets, QR codes, or verify travel documents on the go.

*(Note: The folders `pfa_final` and `rapport_final_v2` contain your final academic reports in LaTeX format).*

---

## 2. 🛠️ Prerequisites (What you need installed on your PC)

If you are on a completely new computer, you must download and install the following tools before doing anything else:

- **Node.js & npm** (Downloads Javascript libraries) 👉 [nodejs.org](https://nodejs.org/)
- **.NET SDK** (Runs the C# Backend) 👉 [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
- **Flutter SDK** (Builds the Mobile App) 👉 [flutter.dev](https://flutter.dev/docs/get-started/install)
  - *Optional:* You will also need Android Studio if you want to run the mobile app on a virtual Android emulator.

---

## 3. 📦 Re-installation Guide (How to install libraries)

Since heavy folders (like `node_modules` and `bin`) are deleted before pushing to GitHub to save space, you must re-download the libraries when you clone the project. 

Open a terminal and run these commands one by one:

**Step 1: Install Backend Libraries**
```bash
cd taifi-travel-back
dotnet restore
cd ..
```

**Step 2: Install Main Frontend Libraries**
```bash
cd taifi-travel-front
npm install
cd ..
```

**Step 3: Install Website Libraries**
```bash
cd website_new
npm install
cd ..
```

**Step 4: Install Mobile App Libraries**
```bash
cd taifi_scanner
flutter pub get
cd ..
```

---

## 4. 🚀 How to Start the App (Running it locally)

To run the entire system, you need to open **multiple terminal windows** at the same time so everything can run parallel to each other.

### Terminal 1: Start the Backend (Do this first!)
The back-end must be running so the websites have data to show.
```bash
cd taifi-travel-back
dotnet run
```

### Terminal 2: Start the Main Frontend
```bash
cd taifi-travel-front
npm run dev
```
*(This will give you a local link, usually `http://localhost:5173`, to view the app in your browser).*

### Terminal 3: Start the New Website
```bash
cd website_new
npm run dev
```

### Terminal 4: Start the Mobile Scanner (Optional)
Make sure your phone is plugged in with USB debugging on, or start an Android Emulator, then run:
```bash
cd taifi_scanner
flutter run
```

---
*Keep this file safe! It is your ultimate reference for understanding and running the Taifi Travel system.*
