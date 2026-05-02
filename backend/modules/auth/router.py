from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db

from modules.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    UserOut,
    AuthResponse,
    RegisterResponse,
    VerifyEmailRequest,
    ResendVerificationRequest,
    RefreshRequest,
    TokenResponse,
    LogoutRequest,
    MessageResponse,
)
from modules.auth import service
from modules.auth.dependencies import get_current_user
from modules.auth.models import User

router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        return service.register_user(db, payload, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with email and password",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        return service.login_user(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post(
    "/verify-email",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify user email",
)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    try:
        service.verify_email(db, payload.token)
        return MessageResponse(message="Email verified successfully. You can now log in.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/verify-email",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify user email via clickable link",
)
def verify_email_link(token: str, db: Session = Depends(get_db)):
    try:
        service.verify_email(db, token)
        return MessageResponse(
            message="Email verified successfully. You can return to TasksPulse and log in."
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Resend email verification token",
)
def resend_verification(
    payload: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    service.resend_verification(db, payload.email, background_tasks)
    return MessageResponse(message="If this email is registered, a verification link has been sent.")


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        return service.refresh_token_pair(db, payload.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout and revoke refresh token",
)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    service.logout_user(db, payload.refresh_token)
    return MessageResponse(message="Logged out successfully")
