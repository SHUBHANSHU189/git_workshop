import random
from datetime import datetime, timedelta, date
from .models import Station, Train, TrainStop, LiveTrainStatus, Corridor, Defect, MaintenanceTask, BlockSchedule, WeatherData, HistoricalPerformance

def seed_database(session):
    random.seed(42)
    
    # 1. Stations
    stations_data = [
        {"name": "New Delhi", "code": "NDLS", "lat": 28.6424, "lng": 77.2195, "zone": "NR"},
        {"name": "Mumbai CST", "code": "CSMT", "lat": 18.9402, "lng": 72.8356, "zone": "CR"},
        {"name": "Howrah", "code": "HWH", "lat": 22.5839, "lng": 88.3428, "zone": "ER"},
        {"name": "Chennai Central", "code": "MAS", "lat": 13.0827, "lng": 80.2707, "zone": "SR"},
        {"name": "Bengaluru", "code": "SBC", "lat": 12.9784, "lng": 77.5716, "zone": "SWR"},
        {"name": "Secunderabad", "code": "SC", "lat": 17.4340, "lng": 78.5018, "zone": "SCR"},
        {"name": "Kolkata", "code": "KOAA", "lat": 22.5697, "lng": 88.3697, "zone": "ER"},
        {"name": "Lucknow", "code": "LKO", "lat": 26.8326, "lng": 80.9215, "zone": "NR"},
        {"name": "Kanpur", "code": "CNB", "lat": 26.4539, "lng": 80.3520, "zone": "NCR"},
        {"name": "Allahabad", "code": "ALD", "lat": 25.4310, "lng": 81.8463, "zone": "NCR"},
        {"name": "Varanasi", "code": "BSB", "lat": 25.3176, "lng": 83.0042, "zone": "NR"},
        {"name": "Patna", "code": "PNBE", "lat": 25.6078, "lng": 85.1423, "zone": "ECR"},
        {"name": "Ghaziabad", "code": "GZB", "lat": 28.6604, "lng": 77.4381, "zone": "NR"},
        {"name": "Meerut", "code": "MTC", "lat": 28.9845, "lng": 77.7064, "zone": "NR"},
        {"name": "Agra", "code": "AGC", "lat": 27.1871, "lng": 78.0182, "zone": "NCR"},
        {"name": "Jaipur", "code": "JP", "lat": 26.9196, "lng": 75.7878, "zone": "NWR"},
        {"name": "Ahmedabad", "code": "ADI", "lat": 23.0245, "lng": 72.5871, "zone": "WR"},
        {"name": "Bhopal", "code": "BPL", "lat": 23.2687, "lng": 77.4121, "zone": "WCR"},
        {"name": "Nagpur", "code": "NGP", "lat": 21.1504, "lng": 79.0949, "zone": "CR"},
        {"name": "Pune", "code": "PUNE", "lat": 18.5285, "lng": 73.8743, "zone": "CR"},
        {"name": "Gwalior", "code": "GWL", "lat": 26.2183, "lng": 78.1828, "zone": "NCR"},
        {"name": "Mathura", "code": "MTJ", "lat": 27.4924, "lng": 77.6737, "zone": "NCR"},
        {"name": "Kota", "code": "KOTA", "lat": 25.1798, "lng": 75.8646, "zone": "WCR"},
        {"name": "Ajmer", "code": "AII", "lat": 26.4521, "lng": 74.6399, "zone": "NWR"},
        {"name": "Jodhpur", "code": "JU", "lat": 26.2859, "lng": 73.0243, "zone": "NWR"},
        {"name": "Udaipur", "code": "UDZ", "lat": 24.5854, "lng": 73.6777, "zone": "NWR"},
        {"name": "Amritsar", "code": "ASR", "lat": 31.6340, "lng": 74.8723, "zone": "NR"},
        {"name": "Chandigarh", "code": "CDG", "lat": 30.6942, "lng": 76.7604, "zone": "NR"},
        {"name": "Dehradun", "code": "DDN", "lat": 30.3165, "lng": 78.0322, "zone": "NR"},
        {"name": "Haridwar", "code": "HW", "lat": 29.9457, "lng": 78.1642, "zone": "NR"},
        {"name": "Jammu Tawi", "code": "JAT", "lat": 32.7266, "lng": 74.8570, "zone": "NR"},
        {"name": "Katra", "code": "SVDK", "lat": 32.9915, "lng": 74.9318, "zone": "NR"},
        {"name": "Guwahati", "code": "GHY", "lat": 26.1445, "lng": 91.7362, "zone": "NFR"},
        {"name": "Dibrugarh", "code": "DBRG", "lat": 27.4728, "lng": 94.9120, "zone": "NFR"},
        {"name": "Bhubaneswar", "code": "BBS", "lat": 20.2689, "lng": 85.8397, "zone": "ECoR"},
        {"name": "Visakhapatnam", "code": "VSKP", "lat": 17.7231, "lng": 83.2896, "zone": "ECoR"},
        {"name": "Vijayawada", "code": "BZA", "lat": 16.5170, "lng": 80.6236, "zone": "SCR"},
        {"name": "Coimbatore", "code": "CBE", "lat": 11.0018, "lng": 76.9558, "zone": "SR"},
        {"name": "Mysore", "code": "MYS", "lat": 12.3049, "lng": 76.6553, "zone": "SWR"},
        {"name": "Thiruvananthapuram", "code": "TVC", "lat": 8.5006, "lng": 76.9552, "zone": "SR"},
        {"name": "Ernakulam", "code": "ERS", "lat": 9.9816, "lng": 76.2999, "zone": "SR"},
        {"name": "Madurai", "code": "MDU", "lat": 9.9252, "lng": 78.1198, "zone": "SR"},
        {"name": "Ranchi", "code": "RNC", "lat": 23.3441, "lng": 85.3096, "zone": "SER"},
        {"name": "Dhanbad", "code": "DHN", "lat": 23.7957, "lng": 86.4304, "zone": "ECR"},
        {"name": "Mughal Sarai", "code": "DDU", "lat": 25.2803, "lng": 83.1187, "zone": "ECR"},
        {"name": "Gorakhpur", "code": "GKP", "lat": 26.7606, "lng": 83.3732, "zone": "NER"},
        {"name": "Bareilly", "code": "BE", "lat": 28.3670, "lng": 79.4304, "zone": "NR"},
        {"name": "Moradabad", "code": "MB", "lat": 28.8386, "lng": 78.7733, "zone": "NR"},
        {"name": "Ambala", "code": "UMB", "lat": 30.3752, "lng": 76.7821, "zone": "NR"},
        {"name": "Ludhiana", "code": "LDH", "lat": 30.9083, "lng": 75.8526, "zone": "NR"},
        {"name": "Jalandhar", "code": "JRC", "lat": 31.3260, "lng": 75.5762, "zone": "NR"},
        {"name": "Raipur", "code": "R", "lat": 21.2514, "lng": 81.6296, "zone": "SECR"},
        {"name": "Bilaspur", "code": "BSP", "lat": 22.0796, "lng": 82.1409, "zone": "SECR"},
        {"name": "Itarsi", "code": "ET", "lat": 22.6177, "lng": 77.7727, "zone": "WCR"},
        {"name": "Katni", "code": "KTE", "lat": 23.8388, "lng": 80.3945, "zone": "WCR"},
        {"name": "Kharagpur", "code": "KGP", "lat": 22.3460, "lng": 87.3239, "zone": "SER"},
        {"name": "Salem", "code": "SA", "lat": 11.6643, "lng": 78.1460, "zone": "SR"},
        {"name": "Tirupati", "code": "TPTY", "lat": 13.6288, "lng": 79.4192, "zone": "SCR"},
        {"name": "Solapur", "code": "SUR", "lat": 17.6599, "lng": 75.9064, "zone": "CR"},
        {"name": "Hubli", "code": "UBL", "lat": 15.3647, "lng": 75.1240, "zone": "SWR"},
    ]
    
    st_dict = {}
    for s in stations_data:
        st = Station(name=s["name"], code=s["code"], latitude=s["lat"], longitude=s["lng"], zone=s["zone"], is_junction=True)
        session.add(st)
        session.flush()
        st_dict[s["code"]] = st.id
        
    session.commit()

    # 2. Trains (subset shown, generated programmatically for brevity)
    trains_data = [
        ("12301", "Howrah Rajdhani Express", "NDLS", "HWH", "Rajdhani", "Daily", 1450),
        ("12302", "Howrah Rajdhani Express", "HWH", "NDLS", "Rajdhani", "Daily", 1450),
        ("12951", "Mumbai Rajdhani Express", "NDLS", "CSMT", "Rajdhani", "Daily", 1384),
        ("12952", "Mumbai Rajdhani Express", "CSMT", "NDLS", "Rajdhani", "Daily", 1384),
        ("12001", "Bhopal Shatabdi Express", "NDLS", "BPL", "Shatabdi", "Daily except Sun", 707),
        ("12002", "Bhopal Shatabdi Express", "BPL", "NDLS", "Shatabdi", "Daily except Sun", 707),
        ("12003", "Lucknow Swarna Shatabdi", "NDLS", "LKO", "Shatabdi", "Daily except Sun", 512),
        ("12004", "Lucknow Swarna Shatabdi", "LKO", "NDLS", "Shatabdi", "Daily except Sun", 512),
        ("12005", "Kalka Shatabdi", "NDLS", "CDG", "Shatabdi", "Daily", 260),
        ("12006", "Kalka Shatabdi", "CDG", "NDLS", "Shatabdi", "Daily", 260),
        ("22435", "Vande Bharat Express", "NDLS", "BSB", "Vande Bharat", "Daily except Mon", 759),
        ("22436", "Vande Bharat Express", "BSB", "NDLS", "Vande Bharat", "Daily except Mon", 759),
        ("22439", "Vande Bharat Express", "NDLS", "SVDK", "Vande Bharat", "Daily except Mon", 655),
        ("22440", "Vande Bharat Express", "SVDK", "NDLS", "Vande Bharat", "Daily except Mon", 655),
        ("12049", "Gatimaan Express", "NDLS", "AGC", "Superfast", "Daily except Fri", 195),
        ("12050", "Gatimaan Express", "AGC", "NDLS", "Superfast", "Daily except Fri", 195),
        ("12259", "Sealdah Duronto", "NDLS", "KOAA", "Duronto", "Mon/Thu", 1453),
        ("12260", "Sealdah Duronto", "KOAA", "NDLS", "Duronto", "Mon/Thu", 1453),
        ("12621", "Tamil Nadu Express", "NDLS", "MAS", "Superfast", "Daily", 2180),
        ("12622", "Tamil Nadu Express", "MAS", "NDLS", "Superfast", "Daily", 2180),
        ("12627", "Karnataka Express", "NDLS", "SBC", "Superfast", "Daily", 2444),
        ("12628", "Karnataka Express", "SBC", "NDLS", "Superfast", "Daily", 2444),
        ("12723", "Telangana Express", "NDLS", "SC", "Superfast", "Daily", 1700),
        ("12724", "Telangana Express", "SC", "NDLS", "Superfast", "Daily", 1700),
        ("12625", "Kerala Express", "NDLS", "TVC", "Superfast", "Daily", 3032),
        ("12626", "Kerala Express", "TVC", "NDLS", "Superfast", "Daily", 3032),
        ("12953", "August Kranti Rajdhani", "NDLS", "CSMT", "Rajdhani", "Daily", 1384),
        ("12954", "August Kranti Rajdhani", "CSMT", "NDLS", "Rajdhani", "Daily", 1384),
        ("12309", "Patna Rajdhani Express", "NDLS", "PNBE", "Rajdhani", "Daily", 998),
        ("12310", "Patna Rajdhani Express", "PNBE", "NDLS", "Rajdhani", "Daily", 998),
        ("12431", "Trivandrum Rajdhani", "NDLS", "TVC", "Rajdhani", "Tue/Fri", 3032),
        ("12432", "Trivandrum Rajdhani", "TVC", "NDLS", "Rajdhani", "Tue/Fri", 3032),
        ("22691", "Bengaluru Rajdhani", "NDLS", "SBC", "Rajdhani", "Mon/Thu/Sat", 2444),
        ("22692", "Bengaluru Rajdhani", "SBC", "NDLS", "Rajdhani", "Mon/Thu/Sat", 2444),
        ("12423", "Dibrugarh Rajdhani", "NDLS", "DBRG", "Rajdhani", "Wed/Sat", 2468),
        ("12424", "Dibrugarh Rajdhani", "DBRG", "NDLS", "Rajdhani", "Wed/Sat", 2468),
        ("12801", "Purushottam Express", "NDLS", "PNBE", "Superfast", "Daily", 998),
        ("12802", "Purushottam Express", "PNBE", "NDLS", "Superfast", "Daily", 998),
        ("12381", "Poorva Express", "NDLS", "HWH", "Superfast", "Daily", 1450),
        ("12382", "Poorva Express", "HWH", "NDLS", "Superfast", "Daily", 1450),
        ("12015", "Ajmer Shatabdi", "NDLS", "AII", "Shatabdi", "Daily except Sun", 444),
        ("12016", "Ajmer Shatabdi", "AII", "NDLS", "Shatabdi", "Daily except Sun", 444),
        ("12903", "Golden Temple Mail", "NDLS", "CSMT", "Mail", "Daily", 1384),
        ("12904", "Golden Temple Mail", "CSMT", "NDLS", "Mail", "Daily", 1384),
        ("12561", "Swatantrata Senani SF", "NDLS", "BSB", "Superfast", "Daily", 759),
        ("12562", "Swatantrata Senani SF", "BSB", "NDLS", "Superfast", "Daily", 759),
        ("12559", "Shiv Ganga Express", "NDLS", "BSB", "Superfast", "Daily", 759),
        ("12560", "Shiv Ganga Express", "BSB", "NDLS", "Superfast", "Daily", 759),
        ("22181", "Jaipur Vande Bharat", "NDLS", "JP", "Vande Bharat", "Daily except Mon", 304),
        ("22182", "Jaipur Vande Bharat", "JP", "NDLS", "Vande Bharat", "Daily except Mon", 304),
        ("12985", "Jaipur Double Decker", "NDLS", "JP", "Superfast", "Daily", 304),
        ("12986", "Jaipur Double Decker", "JP", "NDLS", "Superfast", "Daily", 304),
    ]

    train_objs = []
    for t_num, t_name, s_code, d_code, t_type, days, dist in trains_data:
        train = Train(
            number=t_num, name=t_name, source_station_id=st_dict[s_code], 
            destination_station_id=st_dict[d_code], train_type=t_type, 
            runs_on_days=days, avg_speed_kmph=random.randint(60, 95), 
            total_distance_km=dist, status="running"
        )
        session.add(train)
        train_objs.append(train)
    session.commit()

    # 3. TrainStops
    for tr in train_objs:
        stops_count = random.randint(4, 10)
        st_ids = list(st_dict.values())
        random.shuffle(st_ids)
        route_stops = [tr.source_station_id] + st_ids[:stops_count-2] + [tr.destination_station_id]
        
        dist = 0
        h, m = random.randint(6, 22), 0
        for i, s_id in enumerate(route_stops):
            dist += random.randint(50, 200) if i > 0 else 0
            m += random.randint(45, 90) if i > 0 else 0
            if m >= 60:
                h += m // 60
                m = m % 60
            h = h % 24
            arr = f"{h:02d}:{m:02d}"
            dep = f"{h:02d}:{(m+random.randint(2, 10))%60:02d}"
            
            ts = TrainStop(
                train_id=tr.id, station_id=s_id, stop_order=i+1, 
                scheduled_arrival=arr, scheduled_departure=dep, 
                distance_from_source_km=dist, platform=random.randint(1, 10), 
                halt_duration_minutes=random.randint(2, 10)
            )
            session.add(ts)
    session.commit()

    # 4. LiveTrainStatus
    for tr in train_objs:
        status_val = random.choices(["on_time", "delayed", "late", "very_late"], weights=[60, 25, 10, 5])[0]
        delay = 0
        if status_val == "delayed": delay = random.randint(10, 45)
        elif status_val == "late": delay = random.randint(50, 120)
        elif status_val == "very_late": delay = random.randint(120, 300)
        
        lts = LiveTrainStatus(
            train_id=tr.id, current_station_id=tr.source_station_id, 
            next_station_id=tr.destination_station_id, delay_minutes=delay, 
            current_speed_kmph=random.uniform(80, 160), 
            latitude=28.0, longitude=77.0, last_updated=datetime.utcnow(), 
            status=status_val
        )
        session.add(lts)
    session.commit()

    # 5. Corridors
    corridors = [
        ("Delhi-Howrah Main", "DH-MN", "NDLS", "HWH", 1525, "double", 130, "high"),
        ("Delhi-Mumbai Main", "DM-MN", "NDLS", "CSMT", 1384, "double", 130, "high"),
        ("Delhi-Chennai Main", "DC-MN", "NDLS", "MAS", 2182, "double", 130, "high"),
        ("Delhi-Lucknow", "DL-LK", "NDLS", "LKO", 512, "double", 110, "medium"),
    ]
    cor_ids = []
    for name, code, s, d, l, tt, ms, td in corridors:
        c = Corridor(
            name=name, code=code, start_station_id=st_dict[s], end_station_id=st_dict[d], 
            length_km=l, track_type=tt, max_speed_kmph=ms, traffic_density=td, zone="NR"
        )
        session.add(c)
        session.flush()
        cor_ids.append(c.id)
    session.commit()

    # 6. Defects & Tasks
    defect_types = ['rail_fracture', 'track_geometry', 'signal_failure', 'ohe_damage', 'bridge_defect', 'turnout_defect', 'telecom_failure']
    severities = ['critical', 'high', 'medium', 'low']
    departments = ['track', 'signal', 'ohe', 'bridge', 'telecom']
    
    for _ in range(200):
        d = Defect(
            corridor_id=random.choice(cor_ids), kilometer_mark=random.uniform(10, 1000), 
            defect_type=random.choice(defect_types), severity=random.choice(severities), 
            department=random.choice(departments), reported_date=date.today() - timedelta(days=random.randint(1, 60)), 
            due_date=date.today() + timedelta(days=random.randint(-10, 30)), status=random.choice(['open', 'in_progress', 'scheduled']), 
            description="Sample defect description", reported_by="Inspector"
        )
        session.add(d)
        session.flush()
        
        if random.random() > 0.3:
            t = MaintenanceTask(
                defect_id=d.id, corridor_id=d.corridor_id, department=d.department, 
                task_type=random.choice(['inspection', 'repair', 'replacement', 'tamping']), 
                description="Task description", priority_score=random.uniform(10, 100), 
                risk_level=random.choice(['green', 'yellow', 'red']), estimated_duration_hours=random.uniform(1, 12), 
                planned_date=date.today() + timedelta(days=random.randint(1, 14)), status='pending', 
                crew_size=random.randint(2, 20), safety_criticality=random.randint(1, 5), 
                urgency_score=random.uniform(10, 100)
            )
            session.add(t)
    session.commit()

    # 7. BlockSchedules
    for _ in range(30):
        b = BlockSchedule(
            corridor_id=random.choice(cor_ids), start_time=datetime.utcnow() + timedelta(days=random.randint(1, 7)), 
            end_time=datetime.utcnow() + timedelta(days=random.randint(1, 7), hours=4), 
            block_type=random.choice(['traffic', 'power', 'combined']), status=random.choice(['proposed', 'approved']), 
            departments_involved="track,ohe", task_ids="1,2,3", train_impact_count=random.randint(0, 10), 
            delay_minutes_caused=random.randint(0, 60), utilization_pct=random.uniform(50, 100), 
            risk_tag=random.choice(['green', 'yellow', 'red']), created_at=datetime.utcnow()
        )
        session.add(b)
    session.commit()
