from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import BlockSchedule
from engines.block_optimizer import optimize_blocks, what_if_analysis

router = APIRouter(prefix="/api/blocks", tags=["Blocks"])

@router.get("/")
def list_blocks(db: Session = Depends(get_db)):
    return db.query(BlockSchedule).all()

@router.get("/{block_id}")
def block_details(block_id: int, db: Session = Depends(get_db)):
    return db.query(BlockSchedule).filter(BlockSchedule.id == block_id).first()

@router.post("/optimize")
def run_optimization(db: Session = Depends(get_db)):
    return optimize_blocks(db, None)

@router.patch("/{block_id}/approve")
def approve_block(block_id: int, db: Session = Depends(get_db)):
    block = db.query(BlockSchedule).filter(BlockSchedule.id == block_id).first()
    if block:
        block.status = "approved"
        db.commit()
    return block

@router.post("/what-if")
def what_if(scenario: dict, db: Session = Depends(get_db)):
    return what_if_analysis(db, scenario)

@router.get("/conflicts")
def get_conflicts():
    return []

@router.get("/calendar")
def get_calendar(db: Session = Depends(get_db)):
    return db.query(BlockSchedule).all()
