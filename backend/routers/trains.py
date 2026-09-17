from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Train, LiveTrainStatus, TrainStop
from engines.eta_predictor import predict_eta

router = APIRouter(prefix="/api/trains", tags=["Trains"])

@router.get("/")
def list_trains(db: Session = Depends(get_db)):
    return db.query(Train).all()

@router.get("/search")
def search_trains(q: str, db: Session = Depends(get_db)):
    return db.query(Train).filter(Train.name.contains(q) | Train.number.contains(q)).all()

@router.get("/{train_id}")
def train_details(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    stops = db.query(TrainStop).filter(TrainStop.train_id == train_id).all()
    return {"train": train, "stops": stops}

@router.get("/{train_id}/live")
def live_train_status(train_id: int, db: Session = Depends(get_db)):
    return db.query(LiveTrainStatus).filter(LiveTrainStatus.train_id == train_id).first()

@router.get("/{train_id}/eta")
def train_eta(train_id: int, db: Session = Depends(get_db)):
    return predict_eta(train_id, db)

@router.get("/stats/overview")
def train_stats(db: Session = Depends(get_db)):
    total = db.query(Train).count()
    delayed = db.query(LiveTrainStatus).filter(LiveTrainStatus.status == "delayed").count()
    return {"total_trains": total, "delayed_count": delayed, "on_time_pct": 100 - (delayed / total * 100) if total else 0}
