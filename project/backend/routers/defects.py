from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Defect

router = APIRouter(prefix="/api/defects", tags=["Defects"])

@router.get("/")
def list_defects(db: Session = Depends(get_db)):
    return db.query(Defect).all()

@router.get("/{defect_id}")
def defect_details(defect_id: int, db: Session = Depends(get_db)):
    return db.query(Defect).filter(Defect.id == defect_id).first()

@router.post("/")
def report_defect(db: Session = Depends(get_db)):
    return {"message": "Not implemented"}

@router.patch("/{defect_id}/status")
def update_defect_status(defect_id: int, status: str, db: Session = Depends(get_db)):
    defect = db.query(Defect).filter(Defect.id == defect_id).first()
    if defect:
        defect.status = status
        db.commit()
    return defect

@router.get("/stats")
def defect_stats(db: Session = Depends(get_db)):
    return {"total": db.query(Defect).count()}
