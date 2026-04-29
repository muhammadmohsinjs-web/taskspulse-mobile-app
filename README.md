# TasksPulse

Monorepo for the TasksPulse mobile application.

## Structure

```
├── backend/          # FastAPI + SQLite
│   ├── main.py       # API entry point
│   ├── database.py   # SQLite + SQLAlchemy setup
│   ├── models.py     # DB models
│   ├── schemas.py    # Pydantic schemas
│   └── crud.py       # CRUD operations
│
└── frontend/         # React Native
    ├── App.tsx       # Root component
    ├── app.json      # Expo app config
    └── index.ts      # Expo entry point
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000` — docs at `/docs`.

### Frontend

Requires Node `20.19.4` or newer.

```bash
cd frontend
nvm use 20
npm install
npm start
```

Scan the QR code with Expo Go on iOS. If LAN mode does not connect, start with:

```bash
npm start -- --tunnel
```

## API Endpoints

| Method   | Path            | Description      |
|----------|-----------------|------------------|
| `GET`    | `/health`       | Health check     |
| `GET`    | `/tasks`        | List all tasks   |
| `POST`   | `/tasks`        | Create a task    |
| `GET`    | `/tasks/{id}`   | Get task by ID   |
| `PUT`    | `/tasks/{id}`   | Update a task    |
| `DELETE` | `/tasks/{id}`   | Delete a task    |
