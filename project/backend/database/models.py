from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from .connection import Base

class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    zone = Column(String)
    is_junction = Column(Boolean, default=False)

class Train(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    name = Column(String)
    train_type = Column(String)
    source_station_id = Column(Integer, ForeignKey("stations.id"))
    destination_station_id = Column(Integer, ForeignKey("stations.id"))
    runs_on_days = Column(String)
    avg_speed_kmph = Column(Integer)
    total_distance_km = Column(Integer)
    status = Column(String)

    stops = relationship("TrainStop", back_populates="train")

class TrainStop(Base):
    __tablename__ = "train_stops"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"))
    station_id = Column(Integer, ForeignKey("stations.id"))
    stop_order = Column(Integer)
    scheduled_arrival = Column(String)
    scheduled_departure = Column(String)
    distance_from_source_km = Column(Integer)
    platform = Column(Integer, nullable=True)
    halt_duration_minutes = Column(Integer)

    train = relationship("Train", back_populates="stops")
    station = relationship("Station")

class LiveTrainStatus(Base):
    __tablename__ = "live_train_status"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), unique=True)
    current_station_id = Column(Integer, ForeignKey("stations.id"))
    next_station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    delay_minutes = Column(Integer, default=0)
    current_speed_kmph = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    last_updated = Column(DateTime)
    status = Column(String)
    predicted_eta_next = Column(String, nullable=True)

class Corridor(Base):
    __tablename__ = "corridors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    code = Column(String, unique=True)
    start_station_id = Column(Integer, ForeignKey("stations.id"))
    end_station_id = Column(Integer, ForeignKey("stations.id"))
    length_km = Column(Float)
    track_type = Column(String)
    max_speed_kmph = Column(Integer)
    traffic_density = Column(String)
    zone = Column(String)

class Defect(Base):
    __tablename__ = "defects"
    id = Column(Integer, primary_key=True, index=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"))
    kilometer_mark = Column(Float)
    defect_type = Column(String)
    severity = Column(String)
    department = Column(String)
    reported_date = Column(Date)
    due_date = Column(Date, nullable=True)
    status = Column(String)
    description = Column(Text)
    reported_by = Column(String)

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"
    id = Column(Integer, primary_key=True, index=True)
    defect_id = Column(Integer, ForeignKey("defects.id"), nullable=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"))
    department = Column(String)
    task_type = Column(String)
    description = Column(Text)
    priority_score = Column(Float)
    risk_level = Column(String)
    estimated_duration_hours = Column(Float)
    actual_duration_hours = Column(Float, nullable=True)
    planned_date = Column(Date, nullable=True)
    status = Column(String)
    crew_size = Column(Integer)
    equipment_needed = Column(String, nullable=True)
    safety_criticality = Column(Integer)
    urgency_score = Column(Float)
    overdue_days = Column(Integer, default=0)
    historical_overrun_pct = Column(Float, default=0)

class BlockSchedule(Base):
    __tablename__ = "block_schedules"
    id = Column(Integer, primary_key=True, index=True)
    corridor_id = Column(Integer, ForeignKey("corridors.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    block_type = Column(String)
    status = Column(String)
    departments_involved = Column(String)
    task_ids = Column(String)
    train_impact_count = Column(Integer, default=0)
    delay_minutes_caused = Column(Integer, default=0)
    utilization_pct = Column(Float, default=0)
    risk_tag = Column(String)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime)
    approved_by = Column(String, nullable=True)

class WeatherData(Base):
    __tablename__ = "weather_data"
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"))
    timestamp = Column(DateTime)
    condition = Column(String)
    temperature_c = Column(Float)
    wind_speed_kmph = Column(Float)
    visibility_km = Column(Float)
    impact_on_operations = Column(String)

class HistoricalPerformance(Base):
    __tablename__ = "historical_performance"
    id = Column(Integer, primary_key=True, index=True)
    task_type = Column(String)
    department = Column(String)
    planned_duration_hours = Column(Float)
    actual_duration_hours = Column(Float)
    overrun_pct = Column(Float)
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=True)
    completed_date = Column(Date)
    season = Column(String)
