from datetime import datetime, timezone, timedelta
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_

from modules.auth.models import User, RefreshToken
from modules.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    UserOut,
    AuthResponse,
    RegisterResponse,
    TokenPair,
    TokenResponse,
)
from modules.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    generate_email_verification_token,
    hash_email_verification_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from modules.auth.email_service import (
    send_verification_email,
    build_verification_url,
    EMAIL_DEBUG_PRINT_TOKENS,
)


def _user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        is_active=user.is_active,
        email_verified=user.email_verified,
        created_at=user.created_at,
    )


def _issue_token_pair(user_id: str, db: Session) -> TokenPair:
    """Create access token + refresh token and persist the refresh token."""
    access_token = create_access_token(user_id)

    raw_refresh_token = generate_refresh_token()
    token_hash = hash_refresh_token(raw_refresh_token)

    now = datetime.now(timezone.utc)
    refresh_token_row = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token_row)
    db.commit()

    return TokenPair(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def _find_active_refresh_token(db: Session, raw_token: str) -> RefreshToken | None:
    token_hash = hash_refresh_token(raw_token)
    now = datetime.now(timezone.utc)
    return (
        db.query(RefreshToken)
        .filter(
            and_(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
            )
        )
        .first()
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email, User.is_active.is_(True)).first()


def register_user(
    db: Session, payload: RegisterRequest, background_tasks: BackgroundTasks
) -> RegisterResponse:
    normalized_email = payload.email.lower().strip()

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise ValueError("Email already registered")

    raw_token = generate_email_verification_token()
    token_hash = hash_email_verification_token(raw_token)

    password_hash = hash_password(payload.password)
    user = User(
        email=normalized_email,
        display_name=payload.display_name,
        password_hash=password_hash,
        email_verified=False,
        email_verification_token_hash=token_hash,
        email_verification_expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if EMAIL_DEBUG_PRINT_TOKENS:
        print(f"[DEV] Email verification token for {user.email}: {raw_token}")

    verification_url = build_verification_url(raw_token)
    background_tasks.add_task(send_verification_email, user.email, verification_url)

    return RegisterResponse(
        message="Account created. Please verify your email before logging in.",
        email=user.email,
        verification_required=True,
    )


def login_user(db: Session, payload: LoginRequest) -> AuthResponse:
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise ValueError("Invalid email or password")

    if not user.email_verified:
        raise PermissionError("Please verify your email before logging in")

    if not user.is_active:
        raise ValueError("Invalid email or password")

    tokens = _issue_token_pair(user.id, db)

    return AuthResponse(user=_user_to_out(user), tokens=tokens)


def refresh_token_pair(db: Session, raw_refresh_token: str) -> TokenResponse:
    token_row = _find_active_refresh_token(db, raw_refresh_token)
    if not token_row:
        raise ValueError("Invalid refresh token")

    user = get_user_by_id(db, token_row.user_id)
    if not user:
        token_row.revoked_at = datetime.now(timezone.utc)
        db.commit()
        raise ValueError("Invalid refresh token")

    # Rotate: revoke old, issue new
    token_row.revoked_at = datetime.now(timezone.utc)

    user_id = token_row.user_id
    new_tokens = _issue_token_pair(user_id, db)

    return TokenResponse(
        access_token=new_tokens.access_token,
        refresh_token=new_tokens.refresh_token,
        token_type="bearer",
        expires_in=new_tokens.expires_in,
    )


def verify_email(db: Session, token: str) -> None:
    token_hash = hash_email_verification_token(token)
    now = datetime.now(timezone.utc)

    user = db.query(User).filter(
        User.email_verification_token_hash == token_hash,
        User.email_verification_expires_at > now,
    ).first()

    if not user:
        raise ValueError("Invalid or expired verification token")

    user.email_verified = True
    user.email_verified_at = now
    user.email_verification_token_hash = None
    user.email_verification_expires_at = None
    db.commit()


def resend_verification(
    db: Session, email: str, background_tasks: BackgroundTasks
) -> None:
    normalized_email = email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if user and not user.email_verified:
        raw_token = generate_email_verification_token()
        token_hash = hash_email_verification_token(raw_token)

        user.email_verification_token_hash = token_hash
        user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        db.commit()

        if EMAIL_DEBUG_PRINT_TOKENS:
            print(f"[DEV] Resent email verification token for {user.email}: {raw_token}")

        verification_url = build_verification_url(raw_token)
        background_tasks.add_task(send_verification_email, user.email, verification_url)


def logout_user(db: Session, raw_refresh_token: str) -> None:
    token_hash = hash_refresh_token(raw_refresh_token)
    token_row = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
        .first()
    )
    if token_row:
        token_row.revoked_at = datetime.now(timezone.utc)
        db.commit()
