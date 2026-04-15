# CSE Society | IERT Prayagraj

Welcome to the official repository for the **CSE Society** (Computer Science & Engineering) of the Institute of Engineering and Rural Technology (IERT), Prayagraj.

This project hosts the official website for the society, showcasing upcoming events, news, photo galleries, and our committee members. It features a fully dynamic backend and an Admin Dashboard for managing all society content.

## 🚀 Features
- **Responsive Frontend**: Modern web standards with a responsive layout powered by Tailwind CSS.
- **Dynamic Content**: Connected to a MongoDB / DocumentDB database for seamless updates of News, Events, Committee Members, Faculty, and more.
- **Admin Dashboard CRM**: A secure portal for administrators to upload images/PDFs, manage quick links, set special event banners, and curate gallery items directly from the browser.
- **Integrated File Management**: Automatic cleanup of orphaned files from the server when deleting items or updating documents like the Constitution & Academic Calendar.

## 📁 Repository Structure
The project utilizes a decoupled frontend and backend architecture.

### Frontend
- `/frontend/*.html` - Official society pages and admin portal interface
- `/frontend/css/style.css` - Custom styling and animations
- `/frontend/js/` - Frontend interactions and API fetching logic

### Backend
- `/backend/server.js` - The main Express HTTP server, REST API, and DB connection logic
- `/backend/package.json` - Node dependencies
- `/backend/.env` - Environment variables (MongoDB secrets, Admin tokens)
- `/backend/uploads/` - Local storage directory for admin-uploaded images and documents

## 🛠️ Tech Stack
**Frontend:**
- HTML5 / CSS3
- Vanilla JavaScript (Async/Await Fetch API)
- Tailwind CSS

**Backend:**
- Node.js & Express.js
- MongoDB / DocumentDB (via Mongoose)
- Multer (File Uploads)

## 📌 Development & Setup
To run this project locally, you will need Node.js installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd society_of_computer_science
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   *Note: Ensure you create a `.env` file in the `backend` directory with valid `MONGO_URI` and `ADMIN_PASSWORD` values.*

3. **Start the Server:**
   ```bash
   npm start
   ```
   The backend API will run on `http://localhost:5000`. 

4. **View the Website:**
   Simply open any of the HTML pages (e.g., `frontend/index.html`) directly in your web browser. The frontend is configured to communicate with the local API at `http://localhost:5000/api`.

## 👥 Meet The Team
Designed and maintained by:
- Harshit Pandey 
- Harshit Tripathi 

---
*© 2026 CSE Society IERT | Department of Computer Science & Engineering*
