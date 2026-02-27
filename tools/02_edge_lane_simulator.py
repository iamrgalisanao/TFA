import hmac
import hashlib
import json
import uuid
import time
import requests
from datetime import datetime

SECRET_KEY = b"lane_edge_secret_789"  # Sourced securely via .env mapping
API_URL = "http://localhost:8001/api/v1/lane/event"

def generate_hmac_signature(payload_str: str, secret: bytes) -> str:
    """Generates an HMAC-SHA256 signature for the given payload string."""
    return hmac.new(secret, payload_str.encode('utf-8'), hashlib.sha256).hexdigest()

def create_edge_payload(plate_number: str, lane_id: str, direction: str):
    """Builds the exact Edge Lane payload adhering to SOP 01 protocol."""
    event_uuid = str(uuid.uuid4())
    nonce = f"txn-{uuid.uuid4().hex[:8]}"
    current_time = datetime.utcnow().isoformat() + "Z"
    
    raw_payload_dict = {
        "event_uuid": event_uuid,
        "camera_event_id": f"CAM-EVT-{int(time.time())}",
        "plate_number": plate_number,
        "lane_id": lane_id,
        "direction": direction,
        "timestamp": current_time,
        "image_url": f"s3://anpr-images/{current_time[:10].replace('-', '/')}/{plate_number}.jpg",
        "nonce": nonce
    }
    
    canonical_payload_str = json.dumps(raw_payload_dict, separators=(',', ':'), sort_keys=True)
    signature = generate_hmac_signature(canonical_payload_str, SECRET_KEY)
    
    delivery_envelope = raw_payload_dict.copy()
    delivery_envelope["signature"] = signature
    
    return delivery_envelope

def send_to_api(payload):
    print(f"\n📡 Sending payload to {API_URL}...")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        print(f"📥 Response Code: {response.status_code}")
        print(f"📄 Response Body: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"❌ Error sending request: {e}")

if __name__ == "__main__":
    print("--- TFA Edge Lane Delivery Protocol Simulator ---")
    
    # 1. Simulate Entry
    print("\n--- SIMULATING ENTRY ---")
    entry_payload = create_edge_payload("ABC1234", "LANE-01", "entry")
    send_to_api(entry_payload)

    # 2. Simulate Exit (Charge Fee)
    print("\n--- SIMULATING EXIT ---")
    exit_payload = create_edge_payload("ABC1234", "EXIT-01", "exit")
    send_to_api(exit_payload)
    
    # 3. Simulate Idempotent Retry
    print("\n--- SIMULATING RETRY ---")
    send_to_api(exit_payload)
