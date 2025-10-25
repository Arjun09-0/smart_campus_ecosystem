Smart Campus Backend

Prereqs:
- Node.js (16+)
- MongoDB (local) or MongoDB Atlas

Setup:
1. cd backend
2. npm install
3. Create a `.env` file with `MONGO_URI` and `PORT` if needed.
4. npm run dev

Notes:
- Mongoose models are in `backend/models`.
- Add routes in `backend/routes` and controllers in `backend/controllers` (not yet implemented).
- Recommended: implement JWT auth or Firebase Auth and role-based middleware.
