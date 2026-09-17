from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Train, Defect, BlockSchedule
from engines.risk_engine import get_risk_summary

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    return {
        "total_trains": db.query(Train).count(),
        "total_defects": db.query(Defect).count(),
        "total_blocks": db.query(BlockSchedule).count(),
    }

@router.get("/cis")
def get_cis(db: Session = Depends(get_db)):
    return {
        "blocks_avoided": 15,
        "delay_minutes_saved": 450,
        "cis": 15 * 450
    }

@router.get("/corridors")
def corridor_stats(db: Session = Depends(get_db)):
    return []

@router.get("/departments")
def dept_stats(db: Session = Depends(get_db)):
    return []

@router.get("/risk-summary")
def risk_summary(db: Session = Depends(get_db)):
    return get_risk_summary(db)

@router.get("/trends")
def trends(db: Session = Depends(get_db)):
    return {}
