import requests
import json

data = {
    "age": 28,
    "weight": 100,
    "height": 180,
    "target_weight": 80,
    "goal": "Похудение",
    "requested_days": 14
}

r = requests.post("http://127.0.0.1:8000/predict-goal-timeframe", json=data)
print(json.dumps(r.json(), indent=2, ensure_ascii=False))
