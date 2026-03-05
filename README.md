Expense Tracker Application
=========================

## How to Run the Application

The project is split into two separate servers. You need to run both to use the app.

### 1. Database Setup (MongoDB Atlas)
1. Ensure your MongoDB Atlas cluster is running.
2. In `backend/.env`, replace the `MONGODB_URI` placeholder with your actual connection string.
3. Example: `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expense_tracker`

### 2. Run the Backend API (FastAPI)
Open a new terminal and run:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
*API Docs available at: http://localhost:8000/docs*

### 3. Run the Frontend App (React/Vite)
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*App available at: http://localhost:5173*

## Features Implemented
- **Clean Architecture:** Service layer + Repository layer + Decorators/Middleware.
- **SOLID Principles:** Base repositories, separated concerns.
- **Observer Pattern:** EMI reminders and Spending alerts built as async Observers.
- **Authentication:** JWT with Bearer tokens and bcrypt passwrod hashing.
- **Premium UI:** Dark mode glass-morphism with Recharts data visualization.
