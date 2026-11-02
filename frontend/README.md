# Frontend

This is the separate HTML/CSS/JavaScript frontend. It calls the backend API at `http://localhost:5000`.

## Run it

Keep the backend running in one terminal. In a second terminal:

```bash
cd path/to/shop_ecommerce_separate/frontend
python3 -m http.server 5500
```

Open `http://localhost:5500` in your browser. You can also open `index.html` directly, but using the local server is recommended.
