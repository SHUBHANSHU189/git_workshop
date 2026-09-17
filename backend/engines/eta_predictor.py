import random
from database.models import Train, TrainStop, Station, LiveTrainStatus

def predict_eta(train_id, session):
    random.seed(train_id)
    train = session.query(Train).filter(Train.id == train_id).first()
    live_status = session.query(LiveTrainStatus).filter(LiveTrainStatus.train_id == train_id).first()
    stops = session.query(TrainStop).filter(TrainStop.train_id == train_id).order_by(TrainStop.stop_order).all()
    
    if not train or not stops or not live_status:
        return []

    delay = live_status.delay_minutes
    predictions = []
    
    for stop in stops:
        station = session.query(Station).filter(Station.id == stop.station_id).first()
        
        # Predict delay reduces at ~70% rate per stop
        delay = int(delay * 0.7) if delay > 0 else 0
        
        weather_factor = random.choice([0, 5, 10, 15])  # simplified weather impact
        time_of_day_factor = random.randint(-5, 10)
        noise = random.randint(-2, 5)
        
        total_delay = max(0, delay + weather_factor + time_of_day_factor + noise)
        
        try:
            h, m = map(int, stop.scheduled_arrival.split(':'))
            m += total_delay
            h += m // 60
            m %= 60
            h %= 24
            pred_time = f"{h:02d}:{m:02d}"
        except:
            pred_time = stop.scheduled_arrival

        predictions.append({
            "station_name": station.name,
            "station_code": station.code,
            "scheduled_time": stop.scheduled_arrival,
            "predicted_time": pred_time,
            "delay_minutes": total_delay,
            "confidence": round(random.uniform(0.7, 0.99), 2)
        })
        
    return predictions
