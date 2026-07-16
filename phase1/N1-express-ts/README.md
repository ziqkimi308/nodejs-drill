# Phase 1, Drill 1 (Express + TS + Error Handling)

> **The Foundation** – A minimal, production-adjacent TypeScript Express server with structured error handling.

## 📦 Tech Stack
- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** Express
- **Runner:** tsx (direct TypeScript execution)

## 🚀 Setup & Run

```bash
# Install dependencies
npm install

# Start the server in watch mode
npm run drill:N1
```

The server will start at `http://localhost:3000`.

## 📋 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check – returns `{ status: "OK", timestamp }` |
| `GET` | `/users/:id` | Simulated user lookup (training stub) – validates positive integer IDs, returns mock user data for IDs 1–10 |
| `*` | Any other path | Catch-all 404 – returns `{ error: "Route not found" }` |

## 🧪 Test It

```bash
# Health check
curl http://localhost:3000/health

# Valid user (ID 1–10)
curl http://localhost:3000/users/5

# Invalid ID (negative or string)
curl http://localhost:3000/users/-5

# User not found (ID > 10)
curl http://localhost:3000/users/99

# Non-existent route
curl http://localhost:3000/whatever
```

## 🛡️ Error Handling

- **400 Bad Request** – Invalid input (e.g., non-positive integer ID).
- **404 Not Found** – User not found OR route does not exist.
- **500 Internal Server Error** – Handled by global error middleware.

> 💡 Stack traces are **only shown in `development`** environment. In production, they are hidden for security.

## 🧠 What I Learned
- Setting up TypeScript + Express with `tsx`.
- Parsing and validating route parameters (`req.params`).
- Using `isNaN()` to check if a value is a valid number.
- How `express.json()` middleware parses incoming JSON payloads.
- Routing order: Specific routes → Catch-all (404) → Global Error Handler (500).
- `err.stack` for debugging vs. hiding it in production.
