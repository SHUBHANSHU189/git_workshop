from database.models import Defect, MaintenanceTask, Corridor

def calculate_priority_score(item):
    if isinstance(item, MaintenanceTask):
        safety = item.safety_criticality * 20 # 1-5 scale to 100
        urgency = min(100, item.urgency_score + item.overdue_days * 2)
        operational_impact = 80 # default for dense corridor
        overdue_factor = min(100, (1.1 ** item.overdue_days) * 10)
        resource_readiness = 90
        
        score = (safety * 0.30) + (urgency * 0.25) + (operational_impact * 0.20) + (overdue_factor * 0.15) + (resource_readiness * 0.10)
        return round(score, 2)
    return 50.0

def assign_risk_tag(task):
    if task.estimated_duration_hours < 3.0 and task.historical_overrun_pct < 15:
        return 'green'
    elif task.historical_overrun_pct >= 15 and task.historical_overrun_pct <= 35:
        return 'yellow'
    else:
        return 'red'

def get_risk_summary(session):
    return [
        {"corridor": "Delhi-Howrah", "risk_level": "high", "critical_tasks": 12},
        {"corridor": "Delhi-Mumbai", "risk_level": "medium", "critical_tasks": 5},
    ]
