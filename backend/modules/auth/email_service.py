import os
import logging
from email.message import EmailMessage

import aiosmtplib
from aiosmtplib import SMTPConnectTimeoutError, SMTPReadTimeoutError, SMTPTimeoutError

logger = logging.getLogger(__name__)

EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "false").strip().lower() == "true"
EMAIL_FROM_ADDRESS = os.getenv("EMAIL_FROM_ADDRESS", "")
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "TasksPulse")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_START_TLS = os.getenv("SMTP_START_TLS", "true").strip().lower() == "true"
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").strip().lower() == "true"
SMTP_TIMEOUT_SECONDS = int(os.getenv("SMTP_TIMEOUT_SECONDS", "10"))
EMAIL_VERIFICATION_URL_BASE = os.getenv(
    "EMAIL_VERIFICATION_URL_BASE", "http://localhost:8000/auth/verify-email"
)
EMAIL_VERIFICATION_EXPIRE_HOURS = int(os.getenv("EMAIL_VERIFICATION_EXPIRE_HOURS", "24"))
EMAIL_DEBUG_PRINT_TOKENS = (
    os.getenv("EMAIL_DEBUG_PRINT_TOKENS", "false").strip().lower() == "true"
)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


def build_verification_url(token: str) -> str:
    base = EMAIL_VERIFICATION_URL_BASE.rstrip("/")
    return f"{base}?token={token}"


async def send_verification_email(to_email: str, verification_url: str) -> None:
    if not EMAIL_ENABLED:
        logger.info("[email disabled] would send verification to %s: %s", to_email, verification_url)
        return

    if not SMTP_HOST:
        logger.warning("SMTP_HOST not configured; skipping email to %s", to_email)
        return

    subject = "Verify your TasksPulse account"
    text_body = (
        f"Welcome to TasksPulse!\n\n"
        f"Please verify your email address by clicking the link below:\n\n"
        f"{verification_url}\n\n"
        f"This link expires in {EMAIL_VERIFICATION_EXPIRE_HOURS} hours.\n\n"
        f"If you did not create a TasksPulse account, please ignore this email."
    )
    html_body = (
        "<html><body>"
        f"<h2>Welcome to TasksPulse!</h2>"
        f"<p>Please verify your email address by clicking the button below:</p>"
        f'<p style="text-align:center">'
        f'<a href="{verification_url}" '
        f'style="display:inline-block;padding:12px 24px;background-color:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold">'
        f"Verify Email</a></p>"
        f"<p><small>This link expires in {EMAIL_VERIFICATION_EXPIRE_HOURS} hours.</small></p>"
        f"<p><small>If you did not create a TasksPulse account, please ignore this email.</small></p>"
        "</body></html>"
    )

    message = EmailMessage()
    message["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM_ADDRESS}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        errors, response = await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            use_tls=SMTP_USE_TLS,
            start_tls=SMTP_START_TLS,
            timeout=SMTP_TIMEOUT_SECONDS,
        )
        logger.info("Verification email sent to %s: %s", to_email, response)
    except SMTPConnectTimeoutError:
        logger.exception("SMTP connection timed out for %s", to_email)
    except SMTPReadTimeoutError:
        logger.exception("SMTP read timed out for %s", to_email)
    except SMTPTimeoutError:
        logger.exception("SMTP timeout for %s", to_email)
    except Exception:
        logger.exception("Failed to send verification email to %s", to_email)
