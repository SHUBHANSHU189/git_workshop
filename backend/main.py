from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database.connection import engine, Base, SessionLocal
from database.seed_data import seed_database
from routers import trains, blocks, defects, analytics
import database.models

app = FastAPI(title=settings.app_title, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trains.router)
app.include_router(blocks.router)
app.include_router(defects.router)
app.include_router(analytics.router)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(database.models.Station).count() == 0:
        seed_database(db)
    db.close()

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_title} API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
