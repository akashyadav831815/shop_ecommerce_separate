# ShopEase E-Commerce Project (Separate Frontend + Backend)

## Folder structure

```text
shop_ecommerce_separate/
├── frontend/                 # HTML, CSS, browser JavaScript
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── README.md
└── backend/                  # Node.js + Express REST API
    ├── server.js
    ├── package.json
    ├── schema.sql
    └── database/             # SQLite database is created here on first run
        └── products.db       # auto-generated after backend starts
```

## Requirements
- Node.js and npm installed
- Python 3 (usually already installed on Ubuntu; used only to serve frontend files)

## 1. Start the backend
Open a terminal in the `backend` folder and run:

```bash
cd backend
npm install
npm start
```

The API runs at `http://localhost:5000`. On first start, it creates `backend/database/products.db` and inserts six sample products. Keep this terminal open.

Check the API by opening `http://localhost:5000/api/health` in your browser.

## 2. Start the frontend
Open a second terminal in the project root and run:

```bash
cd frontend
python3 -m http.server 5500
```

Open `http://localhost:5500` in your browser. Keep both terminals running.

## API endpoints
- `GET /api/health` — backend status
- `GET /api/products` — list products
- `GET /api/products?search=watch` — search products
- `GET /api/products?category=Electronics` — filter by category
- `GET /api/products/:id` — details for one product

The database file is stored inside `backend/database/`. Do not create it manually; it is generated automatically.

## Troubleshooting
- `npm: command not found`: install Node.js and npm first, then reopen the terminal. Check with `node -v` and `npm -v`.
- `EADDRINUSE`: port 5000 or 5500 is already in use. Stop the other server or change the port.
- Products fail to load: make sure the backend terminal is running and `http://localhost:5000/api/health` opens successfully.
- If `better-sqlite3` fails to install, ensure Node.js is a supported LTS release and run `npm install` again from `backend`.
