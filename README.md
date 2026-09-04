# QRSpark — Premium QR Code Generator

A modern, responsive, and secure QR Code Generator web application. Built with a React (Vite) + Tailwind CSS v4 frontend and a Python Flask backend that generates QR codes dynamically in-memory.

## Features

- **Dynamic Generation**: Generates QR codes in-memory as binary streams, avoiding unnecessary file writes on the server.
- **Glassmorphic UI**: High-fidelity modern card styling with custom background gradient meshes and hover glow effects.
- **Micro-Animations**: Fluid transitions using Framer Motion (loading rings, dynamic errors, and scan reflection line effects).
- **Responsive Layout**: Seamless presentation on both mobile devices and wide desktop displays.
- **Instant Download**: Download generated codes as PNG directly from the browser.
- **Theme Toggle**: Real-time Light & Dark mode support that remembers system preferences.
- **Input Validation**: Double-sided checks (frontend validation + backend URL parsing) ensuring error-free generation.

---

## Project Structure

```text
c:\Users\yuvra\OneDrive\Desktop\QR MAKER --python/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── App.jsx         # Main App Orchestrator
│   │   ├── index.css       # Tailwind v4 Styles
│   │   └── main.jsx
│   ├── vite.config.js      # Vite Configuration + API Proxy
│   └── package.json
│
├── server/                 # Flask Python Backend
│   ├── app.py              # Application Entrypoint
│   ├── requirements.txt    # Python Packages
│   └── routes/
│       └── qr_routes.py    # QR Endpoints & Validation
```

---

## Local Setup & Installation

Follow these steps to run both the frontend and backend servers on your local machine.

### Prerequisites
- Node.js (v18.0.0 or higher)
- Python (v3.8 or higher)

### 1. Setup the Backend API

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - **Windows (CMD/PowerShell)**:
     ```powershell
     .venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```
   *The backend will boot on `http://127.0.0.1:5000/`.*

---

### 2. Setup the Frontend Client

1. Open a separate terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install the package dependencies:
   ```bash
   npm install
   ```

3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will boot on `http://localhost:5173/`.*

4. Open the browser to `http://localhost:5173/` to use the application!

---

## Production Deployment

### Frontend (Vercel)
Vite projects are fully optimized for one-click deployment on Vercel:
1. Connect your GitHub repository to Vercel.
2. Select the `client` folder as the root directory of the Vercel project (or set the **Root Directory** setting to `client` in the Vercel dashboard).
3. Set the **Build Command** to `npm run build` and the **Output Directory** to `dist`.
4. Add environment variables if needed, then deploy!

### Backend (Render)
You can host the Flask server on Render as a Web Service:
1. Connect your repository to Render.
2. Create a new **Web Service**.
3. Set the **Root Directory** to `server`.
4. Select environment as **Python**.
5. Set the **Build Command** to:
   ```bash
   pip install -r requirements.txt
   ```
6. Set the **Start Command** to run using a production WSGI server like `gunicorn`:
   ```bash
   gunicorn app:app
   ```
   *(Ensure you install `gunicorn` in `requirements.txt` if deploying to production).*
