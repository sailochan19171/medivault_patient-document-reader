# Design Document - Patient Portal

## 1. Tech Stack Choices

### Q1. What frontend framework did you use and why?
**Framework:** React (bootstrapped with Vite)
**Reasoning:**
*   **React:** It is the industry standard for building dynamic, interactive user interfaces. Its component-based architecture allows for a cleaner, modular structure (e.g., separating the Upload Form and Document List into distinct components).
*   **Vite:** used for fast development server start-up and optimized build performance compared to CRA (Create React App).
*   **Vanilla CSS:** To demonstrate foundational CSS skills without relying on heavy utility libraries like Tailwind, ensuring custom, high-quality aesthetics.

### Q2. What backend framework did you choose and why?
**Framework:** Express.js (Node.js)
**Reasoning:**
*   **Simplicity & Speed:** Express is minimal and unopinionated, making it perfect for building a simple REST API quickly.
*   **Ecosystem:** It has excellent middleware support, specifically `multer` for handling `multipart/form-data` (file uploads), which is a core requirement.
*   **JavaScript Everywhere:** Using JS on both ends (Frontend and Backend) reduces context switching.

### Q3. What database did you choose and why?
**Database:** SQLite
**Reasoning:**
*   **Local & File-based:** Since the requirement is to run the application locally without complex setup, SQLite is ideal. It doesn't require installing a separate database server.
*   **Relational:** It supports SQL, allowing for structured data storage (id, filename, metadata) which maps well to the requirements.
*   **Persistency:** Unlike an in-memory database, it persists data to a file (`database.sqlite`), so data isn't lost on restart.

### Q4. If you were to support 1,000 users, what changes would you consider?
1.  **Database Migration:** Move from SQLite to **PostgreSQL** to handle higher concurrency and write loads effectively.
2.  **Object Storage:** instead of storing files on the local disk (`uploads/` folder), I would use a cloud object storage service like **AWS S3** or **Google Cloud Storage**. Local disk storage scales poorly and is hard to manage across multiple server instances.
3.  **Authentication & Authorization:** Implement OAuth2 or JWT-based authentication (e.g., Auth0 or multiple Passport strategies) to ensure users only access their own files.
4.  **Load Balancing:** Run multiple instances of the backend service behind a load balancer (like Nginx) to distribute traffic.
5.  **Rate Limiting:** Implement rate limiting to prevent abuse of the upload endpoint.

---

## 2. Architecture Overview

**Flow:**
[Frontend (React)] <--> [HTTP Requests (Axios/Fetch)] <--> [Backend API (Express)]
                                                                    |
                                                                    +-->(Meta Data)--> [SQLite Database]
                                                                    +-->(File Content)--> [Local Disk /uploads]

1.  **User** interacts with the **React Frontend**.
2.  **Frontend** sends requests (GET, POST, DELETE) to the **Express Backend**.
3.  **Backend** uses `multer` to save the PDF file to the `uploads/` directory on the disk.
4.  **Backend** inserts a record into the **SQLite** database containing the file's metadata and path.
5.  **Backend** responds with success/failure JSON.

---

## 3. API Specification

### 1. Upload Document
*   **Endpoint:** `/api/documents/upload`
*   **Method:** `POST`
*   **Description:** Uploads a PDF file and saves its metadata.
*   **Request:**
    *   Header: `Content-Type: multipart/form-data`
    *   Body: `file` (Binary PDF data)
*   **Response (201 Created):**
    ```json
    {
      "message": "File uploaded successfully",
      "file": {
        "id": 1,
        "filename": "lab_report.pdf",
        "size": 10240,
        "created_at": "2024-12-09T10:00:00.000Z"
      }
    }
    ```

### 2. List Documents
*   **Endpoint:** `/api/documents`
*   **Method:** `GET`
*   **Description:** Retrieves a list of all uploaded documents.
*   **Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "filename": "lab_report.pdf",
        "size": 10240,
        "created_at": "2024-12-09T10:00:00.000Z"
      }
    ]
    ```

### 3. Download Document
*   **Endpoint:** `/api/documents/:id`
*   **Method:** `GET`
*   **Description:** Downloads the actual PDF file associated with the ID.
*   **Response (200 OK):** Binary file stream (Content-Type: application/pdf) with `Content-Disposition: attachment`.

### 4. Delete Document
*   **Endpoint:** `/api/documents/:id`
*   **Method:** `DELETE`
*   **Description:** Deletes the file from the disk and its metadata from the database.
*   **Response (200 OK):**
    ```json
    {
      "message": "File deleted successfully"
    }
    ```

---

## 4. Data Flow Description

### Q5. Steps when a file is uploaded:
1.  User selects a PDF in the Frontend form.
2.  Frontend validates the file type (must be `.pdf`).
3.  Frontend sends a `POST` request with the file as `FormData`.
4.  Express backend receives the request.
5.  `multer` middleware intercepts the file, generates a unique filename (to prevent overwrites), and saves it to `backend/uploads/`.
6.  Controller logic takes the file info (original name, path, size) and inserts a row into the Documents table in SQLite.
7.  Backend returns the new document object to the Frontend.
8.  Frontend adds the new document to the list view.

### Steps when a file is downloaded:
1.  User clicks "Download" on a document item.
2.  Frontend requests `GET /api/documents/:id`.
3.  Backend looks up the database record by `id`.
4.  Backend retrieves the `filepath` from the record.
5.  Backend checks if the file exists on the disk.
6.  Backend streams the file to the response with appropriate headers to trigger a download in the browser.

---

## 5. Assumptions

### Q6. Assumptions made:
1.  **Single User Environment:** As stated in requirements, no authentication is implemented. All documents are visible to anyone.
2.  **File Validation:** Strict validation for `.pdf` MIME types on both frontend and backend to prevent uploading malicious scripts or other file types.
3.  **File Size:** Assumed a reasonable limit (e.g., 5MB or 10MB) is sufficient for standard medical documents.
4.  **Persistence:** The `uploads/` folder must exist. The application handles checking/creating this folder on startup to avoid errors.
5.  **Concurrency:** Since sqlite is file-based, write concurrency is limited, but sufficient for a local/demo app.
6.  **Browser:** Modern browser support for the Frontend (ES6+).
