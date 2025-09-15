final-nodejs/
├─ package.json
├─ index.js              # server chính (Express)
├─ config/
│  └─ db.js              # kết nối MongoDB
├─ models/
│  └─ User.js
├─ routes/
│  ├─ auth.js            # đăng ký/đăng nhập
│  └─ users.js           # CRUD user
├─ middlewares/
│  └─ auth.js            # middleware JWT
├─ views/                # giao diện EJS
│  ├─ layout.ejs
│  ├─ index.ejs
│  └─ login.ejs
├─ public/               # static (css/js/images)
│  ├─ styles.css
│  └─ js/main.js
└─ .env

Chạy sever:
npm run dev
