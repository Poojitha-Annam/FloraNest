# 🌿 FloraNest – Online Plant & Flower Store

FloraNest is a full-stack e-commerce web application developed to make buying flowers, bouquets, and plants simple and convenient. It provides customers with a smooth shopping experience and administrators with tools to manage store operations.

## ✨ Features

### Customer Features
- User Registration and Login
- Browse flowers, bouquets, and plants
- Add products to cart
- Update product quantities and remove items
- Secure checkout workflow
- View and track orders
- Responsive user interface

### Admin Features
- Admin Login
- Dashboard
- Product Management
- Category Management
- Customer Management
- Inventory Management
- Order Management
- Reports

## 🛠️ Technologies Used

| Frontend | Backend | Database |
|---|---|---|
| React.js | Node.js | MySQL |
| HTML | Express.js | |
| CSS | JavaScript | |
| JavaScript | | |

## 📁 Project Structure

```text
FloraNest/
│
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── adminRoutes.js
│   ├── orderTrackingRoutes.js
│   └── package.json
│
├── floranest/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
└── .gitignore
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FloraNest
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure your `backend/.env` file with your MySQL database credentials.

### 3. Start Backend

```bash
node server.js
```

### 4. Frontend Setup

Open another terminal:

```bash
cd floranest
npm install
npm run dev
```

Open the local URL displayed in your terminal.

## 🗄️ Database

FloraNest uses MySQL for storing application data.

Configure your database connection using the backend environment variables.

## 🎨 UI Theme

FloraNest follows a green and cream color theme to create a fresh, natural, and user-friendly shopping experience.

## 🚀 Future Enhancements

- Online Payment Integration
- Enhanced Order Tracking
- Additional Customer Features
- Improved Product Recommendations

## 👩‍💻 Developer

**FloraNest – Full Stack E-Commerce Project**

Developed using React.js, Node.js, Express.js, and MySQL.

---

⭐ If you like this project, consider giving it a star!