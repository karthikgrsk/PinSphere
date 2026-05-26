# PinSphere Frontend

React.js + Vite + Tailwind CSS frontend application.

## Installation
```bash
npm install
```

## Running Dev Server
```bash
npm run dev
```

## Building for Production
```bash
npm run build
```

## Environment Variables (.env)
Create a `.env` file in the root of the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
During production deployment on Vercel, set `VITE_API_URL` to your live backend endpoint, e.g., `https://pinsphere-backend.onrender.com/api`.
