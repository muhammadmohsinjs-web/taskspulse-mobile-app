---
name: fastapi-endpoint-builder
description: Use when creating or updating FastAPI endpoints, Pydantic schemas, SQLAlchemy models, CRUD operations, or database changes.
---

# FastAPI Endpoint Builder Skill

Use this workflow for backend API work.

## Step 1: Understand Existing Patterns

Before editing:

- Read existing models in `backend/models.py`
- Read existing schemas in `backend/schemas.py`
- Read existing CRUD in `backend/crud.py`
- Read existing routes in `backend/main.py`
- Read database setup in `backend/database.py`

## Step 2: Define Endpoint Requirements

Clarify:

- Endpoint purpose
- HTTP method (GET, POST, PUT, DELETE, PATCH)
- Path
- Request body schema
- Response schema
- Query parameters
- Path parameters
- Error responses
- Business logic needed

## Step 3: Build in Order

When implementing, follow this order:

1. **Model** (if new table): Add SQLAlchemy model in `models.py`
2. **Schema**: Add Pydantic Create/Update/Out schemas in `schemas.py`
3. **CRUD**: Add business logic functions in `crud.py`
4. **Route**: Add FastAPI endpoint in `main.py`
5. **Database table**: Run `Base.metadata.create_all` if new model (auto-runs on startup)

### Model Pattern

```python
class Thing(Base):
    __tablename__ = "things"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### Schema Pattern

```python
class ThingCreate(BaseModel):
    name: str

class ThingUpdate(BaseModel):
    name: str | None = None

class ThingOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
```

### CRUD Pattern

```python
def get_things(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Thing).offset(skip).limit(limit).all()

def get_thing(db: Session, thing_id: int):
    return db.query(Thing).filter(Thing.id == thing_id).first()

def create_thing(db: Session, thing: ThingCreate):
    db_thing = Thing(**thing.model_dump())
    db.add(db_thing)
    db.commit()
    db.refresh(db_thing)
    return db_thing

def update_thing(db: Session, thing_id: int, thing: ThingUpdate):
    db_thing = db.query(Thing).filter(Thing.id == thing_id).first()
    if not db_thing:
        return None
    for key, value in thing.model_dump(exclude_unset=True).items():
        setattr(db_thing, key, value)
    db.commit()
    db.refresh(db_thing)
    return db_thing

def delete_thing(db: Session, thing_id: int):
    db_thing = db.query(Thing).filter(Thing.id == thing_id).first()
    if not db_thing:
        return None
    db.delete(db_thing)
    db.commit()
    return db_thing
```

### Route Pattern

```python
@app.get("/things", response_model=list[ThingOut])
def list_things(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_things(db, skip=skip, limit=limit)

@app.post("/things", response_model=ThingOut, status_code=status.HTTP_201_CREATED)
def create_new_thing(thing: ThingCreate, db: Session = Depends(get_db)):
    return create_thing(db, thing)

@app.get("/things/{thing_id}", response_model=ThingOut)
def read_thing(thing_id: int, db: Session = Depends(get_db)):
    thing = get_thing(db, thing_id)
    if not thing:
        raise HTTPException(status_code=404, detail="Thing not found")
    return thing

@app.put("/things/{thing_id}", response_model=ThingOut)
def update_existing_thing(thing_id: int, thing: ThingUpdate, db: Session = Depends(get_db)):
    updated = update_thing(db, thing_id, thing)
    if not updated:
        raise HTTPException(status_code=404, detail="Thing not found")
    return updated

@app.delete("/things/{thing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_thing(thing_id: int, db: Session = Depends(get_db)):
    if not delete_thing(db, thing_id):
        raise HTTPException(status_code=404, detail="Thing not found")
```

## Step 4: Verify

After implementation:

- Check imports are correct
- Check endpoint appears in Swagger at `/docs`
- Check response_model is set on all endpoints
- Check proper status codes
- Check 404 handling
- Check snake_case field names (matching SQLAlchemy columns)
