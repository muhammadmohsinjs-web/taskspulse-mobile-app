import pytest
import tempfile
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone, timedelta

from database import Base, get_db
from main import app
from modules.auth.models import User
from modules.auth.security import (
    generate_email_verification_token,
    hash_email_verification_token,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    global TestingSessionLocal, engine
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    url = f"sqlite:///{path}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    engine.dispose()
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(path):
        os.remove(path)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_login_unknown_email_returns_401(client):
    response = client.post("/auth/login", json={
        "email": "not-registered@example.com",
        "password": "anything"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_invalid_email_format_returns_422(client):
    response = client.post("/auth/login", json={
        "email": "not-an-email",
        "password": "anything"
    })
    assert response.status_code == 422


def test_register_creates_unverified_user(client):
    response = client.post("/auth/register", json={
        "email": "new-user@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new-user@example.com"
    assert data["verification_required"] is True
    assert "tokens" not in data


def test_register_does_not_return_tokens(client):
    response = client.post("/auth/register", json={
        "email": "new-user@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "tokens" not in data
    assert "access_token" not in data


def test_login_unverified_returns_403(client):
    client.post("/auth/register", json={
        "email": "unverified@example.com",
        "password": "password123"
    })

    response = client.post("/auth/login", json={
        "email": "unverified@example.com",
        "password": "password123"
    })
    assert response.status_code == 403
    assert "verify" in response.json()["detail"].lower()


def test_verify_email_with_invalid_token_fails(client):
    response = client.post("/auth/verify-email", json={
        "token": "invalid-token"
    })
    assert response.status_code == 400


def test_verify_email_with_valid_token_succeeds(client):
    client.post("/auth/register", json={
        "email": "verify-test@example.com",
        "password": "password123"
    })

    db = next(override_get_db())
    user = db.query(User).filter(User.email == "verify-test@example.com").first()

    raw_token = generate_email_verification_token()
    user.email_verification_token_hash = hash_email_verification_token(raw_token)
    user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()

    response = client.post("/auth/verify-email", json={"token": raw_token})
    assert response.status_code == 200
    assert "verified" in response.json()["message"].lower()


def test_login_after_verification_succeeds(client):
    client.post("/auth/register", json={
        "email": "verified-user@example.com",
        "password": "password123"
    })

    db = next(override_get_db())
    user = db.query(User).filter(User.email == "verified-user@example.com").first()

    raw_token = generate_email_verification_token()
    user.email_verification_token_hash = hash_email_verification_token(raw_token)
    user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()

    client.post("/auth/verify-email", json={"token": raw_token})

    response = client.post("/auth/login", json={
        "email": "verified-user@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "tokens" in response.json()


def test_wrong_password_returns_401(client):
    client.post("/auth/register", json={
        "email": "pwd-test@example.com",
        "password": "password123"
    })

    db = next(override_get_db())
    user = db.query(User).filter(User.email == "pwd-test@example.com").first()

    raw_token = generate_email_verification_token()
    user.email_verification_token_hash = hash_email_verification_token(raw_token)
    user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()

    client.post("/auth/verify-email", json={"token": raw_token})

    response = client.post("/auth/login", json={
        "email": "pwd-test@example.com",
        "password": "wrong-password"
    })
    assert response.status_code == 401


def test_duplicate_registration_returns_409(client):
    client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123"
    })

    response = client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123"
    })
    assert response.status_code == 409


def test_inactive_user_login_returns_401(client):
    client.post("/auth/register", json={
        "email": "inactive@example.com",
        "password": "password123"
    })

    db = next(override_get_db())
    user = db.query(User).filter(User.email == "inactive@example.com").first()

    raw_token = generate_email_verification_token()
    user.email_verification_token_hash = hash_email_verification_token(raw_token)
    user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()

    client.post("/auth/verify-email", json={"token": raw_token})

    user.is_active = False
    db.commit()

    response = client.post("/auth/login", json={
        "email": "inactive@example.com",
        "password": "password123"
    })
    assert response.status_code == 401
