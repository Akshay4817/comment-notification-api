Comment Notification API

Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (Auth) + Bcrypt
- Nodemailer (Emails)
- Socket.IO (Real-time notifications)

Setup
1. Clone & Install:
 git clone https://github.com/your-username/comment-api.git
 cd comment-api
 npm install

2. Environment (env):
- PORT
- MONGO_URI
- JWT_SECRET

3. Run:
- npm run dev
- Auth API
- POST /auth/register -> Register user
- POST /auth/login -> Login + JWT
- GET /auth/me -> Current user info
- Comment API
- POST /comments -> Post comment or reply
- GET /comments/:postId -> All comments (flat)
- GET /comments/nested/:postId -> Nested comment tree
- PATCH /comments/:commentId -> Edit comment (author)
- DELETE /comments/:commentId -> Delete (author/admin)
- Notification API
- GET /notifications -> All notifications
- PATCH /notifications/:id/read -> Mark one read
- PATCH /notifications/mark-all-read -> Mark all read
- DELETE /notifications/:id -> Delete notification
- Real-Time (Socket.IO)
- Emits 'notification' to receiverUserId on new comment, reply, or mention.
- Comment Notification API


Features
- JWT auth with bcrypt
- Nested replies
- @mention parsing
- Email alerts via Nodemailer
- Socket.IO push notifications
- Read/Delete notifications

Author
- Akshay Negi