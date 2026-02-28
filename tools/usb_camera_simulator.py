import cv2
import requests
import json
import uuid
import time
import hmac
import hashlib
import re
import os
import numpy as np
from datetime import datetime

# --- Tesseract OCR ---
import pytesseract
import platform

# Handle Tesseract path across OS
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
else:
    # On Mac/Linux, we assume it is in the PATH. 
    # If using Homebrew on Apple Silicon: /opt/homebrew/bin/tesseract
    pass

# --- Configurations ---
# API_URL = "http://localhost:8001/api/v1/lane/event"
API_URL = "http://tfa.abbadev.com/api/v1/lane/event"
SECRET_KEY = b"lane_edge_secret_789"
TMP_DIR = os.path.join(os.path.dirname(__file__), "../.tmp/camera_snaps")

if not os.path.exists(TMP_DIR):
    os.makedirs(TMP_DIR)

# --- Helpers ---
def generate_hmac_signature(payload_str: str, secret: bytes) -> str:
    return hmac.new(secret, payload_str.encode('utf-8'), hashlib.sha256).hexdigest()

def create_edge_payload(plate_number: str, lane_id: str, direction: str, image_path: str):
    event_uuid = str(uuid.uuid4())
    nonce = f"txn-{uuid.uuid4().hex[:8]}"
    current_time = datetime.utcnow().isoformat() + "Z"
    raw = {
        "event_uuid": event_uuid,
        "camera_event_id": f"CAM-EVT-{int(time.time())}",
        "plate_number": plate_number,
        "lane_id": lane_id,
        "direction": direction,
        "timestamp": current_time,
        "image_url": image_path,
        "nonce": nonce
    }
    sig = generate_hmac_signature(json.dumps(raw, separators=(',', ':'), sort_keys=True), SECRET_KEY)
    return {**raw, "signature": sig}

def preprocess_for_ocr(frame):
    """
    Preprocessing pipeline optimised for handwritten uppercase plate numbers.
    1. Crop the centre 60% of the frame (where the user should hold the plate).
    2. Convert to greyscale.
    3. Apply adaptive thresholding to handle varying light conditions.
    4. Slight dilation to thicken thin strokes.
    """
    h, w = frame.shape[:2]
    # Crop centre region
    y1, y2 = int(h * 0.2), int(h * 0.8)
    x1, x2 = int(w * 0.1), int(w * 0.9)
    roi = frame[y1:y2, x1:x2]

    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    # Upscale 2x — Tesseract performs better on larger images
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    # Adaptive threshold handles shadows and uneven lighting
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY, 31, 10)
    # Mild dilation
    kernel = np.ones((1, 1), np.uint8)
    thresh = cv2.dilate(thresh, kernel, iterations=1)
    return thresh, roi

def extract_plate_text(frame):
    """Run OCR and return cleaned plate-like string."""
    processed, _ = preprocess_for_ocr(frame)
    # Tesseract config: SINGLE_BLOCK, alphanumeric only
    config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    raw_text = pytesseract.image_to_string(processed, config=config)
    # Clean: keep only alphanumeric, max 8 chars (standard PH plate: 3 letters + 4 digits)
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    return cleaned[:8]

def send_event(plate, lane_id, direction, filepath):
    payload = create_edge_payload(plate, lane_id, direction, filepath)
    try:
        resp = requests.post(API_URL, json=payload,
                             headers={"Accept": "application/json", "Content-Type": "application/json"},
                             timeout=5)
        if resp.status_code == 201:
            res = resp.json()
            return f"{res.get('action','?').upper()} — {res.get('reason','?')}"
        else:
            return f"API {resp.status_code}: {resp.json().get('message','Error')}"
    except Exception as e:
        return f"CONN ERROR: {str(e)[:30]}"

# --- Main ---
def start_capture():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Camera not found."); return

    print("\n=== TFA Edge Simulator — OCR Mode ===")
    print("  SPACE : Capture & auto-read plate")
    print("  1     : Entry Lane (LANE-01)")
    print("  2     : Exit Lane  (EXIT-01)")
    print("  C     : Confirm detected plate")
    print("  R     : Retry OCR scan")
    print("  Q     : Quit\n")

    current_lane = "LANE-01"
    current_direction = "entry"
    status_msg = "Ready"
    detected_plate = None
    last_frame = None
    confirm_mode = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Save a clean snapshot BEFORE drawing any overlays (for OCR)
        clean_frame = frame.copy()

        # Draw scan zone guide rectangle
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (int(w*0.1), int(h*0.2)), (int(w*0.9), int(h*0.8)),
                      (0, 255, 120), 2)
        cv2.putText(frame, "Hold plate INSIDE the box", (int(w*0.1)+5, int(h*0.18)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 120), 1)

        # Top HUD
        cv2.rectangle(frame, (0, 0), (w, 50), (15, 23, 42), -1)
        cv2.putText(frame, f"LANE: {current_lane}  ({current_direction.upper()})",
                    (10, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (16, 185, 129), 2)

        # Bottom HUD
        cv2.rectangle(frame, (0, h - 55), (w, h), (15, 23, 42), -1)
        if confirm_mode and detected_plate:
            cv2.putText(frame, f"PLATE: {detected_plate}   [C]=Send  [R]=Re-capture",
                        (10, h - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 220, 50), 2)
            cv2.putText(frame, "C=Confirm  R=Re-capture   SPACE=Rescan", (10, h - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        else:
            cv2.putText(frame, f"Status: {status_msg}",
                        (10, h - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            cv2.putText(frame, "SPACE=Capture  1=Entry  2=Exit  Q=Quit",
                        (10, h - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1)

        cv2.imshow("TFA Edge Simulator — OCR Mode", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break

        # These keys always work regardless of mode
        if key == ord('1'):
            current_lane = "LANE-01"; current_direction = "entry"
            status_msg = "Lane: ENTRY"; confirm_mode = False
        elif key == ord('2'):
            current_lane = "EXIT-01"; current_direction = "exit"
            status_msg = "Lane: EXIT"; confirm_mode = False

        elif key == ord(' '):
            # SPACE always captures a fresh clean frame (no overlay text)
            status_msg = "Scanning..."
            last_frame = clean_frame  # use the pre-overlay snapshot
            plate = extract_plate_text(last_frame)
            if plate:
                detected_plate = plate
                status_msg = f"Detected: {plate}"
                confirm_mode = True
            else:
                status_msg = "OCR: Nothing detected — adjust plate & press SPACE again"
                confirm_mode = False

        elif confirm_mode:
            if key == ord('c'):
                # Save + Send
                ts = int(time.time())
                filepath = os.path.join(TMP_DIR, f"plate_{ts}.jpg")
                cv2.imwrite(filepath, last_frame)
                result = send_event(detected_plate, current_lane, current_direction, filepath)
                status_msg = result
                print(f"📡 [{detected_plate}] {result}")
                confirm_mode = False
                detected_plate = None
            elif key == ord('r'):
                # R = go back to live feed, let user re-capture with SPACE
                confirm_mode = False
                detected_plate = None
                status_msg = "Ready — aim plate and press SPACE"

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    start_capture()
