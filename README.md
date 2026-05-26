# PinSphere — Pinterest-inspired Full Stack MVP

PinSphere is a premium, high-performance image and video sharing platform. This MVP features a responsive masonry feed, paginated infinite scroll, drag-and-drop media uploads, instant search, and JWT authentication.

---

## Technical Stack
*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Axios, React Router, Lucide Icons.
*   **Backend**: Node.js, Express, MongoDB Mongoose.
*   **Storage & Uploads**: Cloudinary (with local disk-storage fallback).
*   **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing.
*   **Deployment**: Vercel (Frontend) & Render (Backend).

---

## Folder Structure
```
PinSphere/
 ├── backend/            # Express Node Server APIs
 │    ├── config/        # Mongoose & Cloudinary setup
 │    ├── controllers/   # Route handlers (Auth, Posts)
 │    ├── middleware/    # Auth token verification
 │    ├── models/        # Schemas (User, Post)
 │    ├── routes/        # API route maps
 │    └── server.js      # Server entry point
 └── frontend/           # React + Vite client app
      ├── src/
      │    ├── components/ # Navbar, PostCard, Skeletons, UploadModal
      │    ├── context/    # Auth context state provider
      │    ├── pages/      # Home, Login, Register
      │    └── services/   # Axios API service configuration
      └── index.html
```

---

## Local Quickstart

### Prerequisites
Make sure you have Node.js (v16+) installed.

### 1. Run the Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Configure your local env:
   - Create a `.env` file from the example: `cp .env.example .env`
   - Update `MONGODB_URI` with your connection string (supports local MongoDB fallback: `mongodb://127.0.0.1:27017/pinsphere`).
   - If Cloudinary variables are left as `placeholder`, the backend automatically falls back to storing uploads inside `backend/uploads/` on your disk!
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

### 2. Run the Frontend
1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## Production Setup & Hosting Guides

### 1. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared cluster (free tier).
3. Under **Database Access**, create a user with read/write access.
4. Under **Network Access**, add an IP entry for `0.0.0.0/0` (allows Render backend to connect).
5. Go to **Clusters** → **Connect** → **Drivers** and copy the connection string. Replace the password placeholder with your database user password.

### 2. Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard page.
3. Add these credentials to your backend environment variables to enable global image/video uploads.

### 3. Backend Deployment (Render)
1. Log in to [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your Git repository.
4. Set the following options:
   *   **Name**: `pinsphere-backend`
   *   **Root Directory**: `backend`
   *   **Runtime**: `Node`
   *   **Build Command**: `npm install --legacy-peer-deps`
   *   **Start Command**: `node server.js`
5. Click **Advanced** and add the environment variables:
   *   `PORT` = `10000` (Render default)
   *   `NODE_ENV` = `production`
   *   `MONGODB_URI` = *(Your Atlas connection string)*
   *   `JWT_SECRET` = *(Choose a strong random string)*
   *   `CLOUDINARY_CLOUD_NAME` = *(Your Cloudinary cloud name)*
   *   `CLOUDINARY_API_KEY` = *(Your Cloudinary API key)*
   *   `CLOUDINARY_API_SECRET` = *(Your Cloudinary API secret)*
   *   `FRONTEND_URL` = *(Your Vercel deployment URL e.g. `https://pinsphere.vercel.app`)*
6. Click **Create Web Service**.

### 4. Frontend Deployment (Vercel)
1. Install Vercel CLI locally (`npm i -g vercel`) or import your repository directly into the [Vercel Dashboard](https://vercel.com).
2. If importing through the Vercel dashboard:
   *   Set **Framework Preset** to `Vite`.
   *   Set **Root Directory** to `frontend`.
   *   **Build Command**: `npm run build`
   *   **Output Directory**: `dist`
3. Add the environment variables:
   *   `VITE_API_URL` = *(Your Render backend URL e.g. `https://pinsphere-backend.onrender.com/api`)*
4. Click **Deploy**.

---

## Production CORS Config
To protect your database, the Express backend CORS policy checks incoming origins:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);
```
Ensure that `FRONTEND_URL` in the Render environment matches your exact Vercel URL (without a trailing slash).

---

## Launch Day Checklist
- [ ] MongoDB Atlas cluster created & network configured (`0.0.0.0/0`).
- [ ] Cloudinary storage account active & tokens copied.
- [ ] Render Backend deployed and returns `{"status":"OK"}` on `/health`.
- [ ] JWT security key randomized.
- [ ] Vercel Frontend deployed with `VITE_API_URL` configured correctly.
- [ ] Tested register/login page on staging URL.
- [ ] Uploaded test JPEG image and verified it renders in masonry grid.
- [ ] Uploaded test MP4 video and verified it autoplays on hover.
- [ ] Executed custom search querying matching posts.
