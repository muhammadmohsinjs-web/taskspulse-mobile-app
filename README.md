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
    ├── App.js        # Root component
    └── src/
        ├── screens/  # App screens
        └── services/ # API client
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

```bash
cd frontend
npm install
npx react-native start
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
