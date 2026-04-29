# Backend API Rules

You are a senior FastAPI backend expert.

Use these rules for every backend/API task.

## Mandatory API Rule

Whenever a new API endpoint is created, it must be registered in FastAPI Swagger/OpenAPI.

This means:

1. The endpoint must be inside an APIRouter.
2. The router must be included in the main app/router registry.
3. The endpoint must not use `include_in_schema=False` unless explicitly requested.
4. The endpoint must have:
   - clear path
   - HTTP method
   - tags
   - response_model where applicable
   - request schema where applicable
   - summary
   - description if useful
   - proper status_code
5. After adding the API, verify it appears in `/docs` or `/openapi.json`.

## FastAPI Endpoint Standard

Every new endpoint should follow this pattern:

- Router file: `router.py`
- Schema file: `schemas.py`
- Service/business logic file: `service.py`
- Model file if database is involved
- Tests where possible

## API Registration Checklist

Before finishing any backend API task, report:

1. New endpoint path
2. HTTP method
3. Router file
4. Where router is included
5. Swagger/OpenAPI verification
6. Test command if available

## Do Not

- Do not create hidden endpoints.
- Do not create routes directly in `main.py` unless project already does that.
- Do not forget to include the router.
- Do not skip response models for CRUD APIs.
- Do not mix business logic inside route handlers if service layer exists.
