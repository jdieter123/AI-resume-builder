# AI Resume Builder

## Overview

This application allows users to create professional resumes by selecting jobs, skills, certifications, and awards. It also integrates AI to improve resume content.

## Features

* Add and manage jobs
* Add skills, certifications, and awards
* Generate formatted resumes
* AI-powered resume rewriting using Google Gemini
* Print resumes as PDF
* User-provided API key support

## Technologies Used

* HTML, CSS (Bootstrap), JavaScript
* Node.js + Express
* SQLite3
* SweetAlert2
* Google Gemini API

## Setup Instructions

### 1. Install Dependencies

```
npm install express cors @google/genai sqlite3
```

### 2. Run Server

```
node server.js
```

### 3. Open Application

Open `index.html` in your browser

### 4. API Key

Enter your Google Gemini API key in the app and click "Save API Key"
