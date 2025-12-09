# MediVault - Patient Document Portal

A simple, secure full-stack application for managing patient medical documents (PDFs). Built as part of the Full Stack Developer Intern assignment.

## Project Overview

MediVault allows users to:
*   **Upload** PDF documents (Consultation notes, Lab reports, etc.).
*   **View** a list of all uploaded documents with metadata.
*   **Download** documents to their local machine.
*   **Delete** documents when they are no longer needed.

## Tech Stack

*   **Frontend:** React, Vite, Vanilla CSS (Modern aesthetic)
*   **Backend:** Node.js, Express
*   **Database:** SQLite (Local file-based database)
*   **Storage:** Local file system (`uploads/`)

## Prerequisites

*   Node.js (v14 or higher) installed.
*   npm (v6 or higher) installed.

## How to Run Locally

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node src/server.js
    ```
    *The server will run on `http://localhost:5000`.*
    *It will automatically create an `uploads/` folder and a `database.sqlite` file in the parent directory.*

### 2. Frontend Setup

1.  Open a **new terminal** and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and visit the URL shown (usually `http://localhost:5173`).

---

## Example API Calls

You can interact with the backend directly using `curl` or Postman.

### 1. Upload a File
```bash
curl -X POST -F "file=@/path/to/your/document.pdf" http://localhost:5000/api/documents/upload
```

### 2. List All Documents
```bash
curl http://localhost:5000/api/documents
```

### 3. Download a Document
(Replace `:id` with the actual ID from the list response)
```bash
curl -O -J http://localhost:5000/api/documents/1
```

### 4. Delete a Document
(Replace `:id` with the actual ID)
```bash
curl -X DELETE http://localhost:5000/api/documents/1
```
