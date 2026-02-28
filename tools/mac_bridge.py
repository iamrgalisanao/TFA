
import http.server
import socketserver
import subprocess
import os

PORT = 9005  # The bridge listens on this port locally

class BridgeHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle CORS so the live website can talk to localhost
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        self._handle_trigger()

    def do_GET(self):
        if self.path == '/trigger-scan':
            self._handle_trigger()
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Bridge is running. Hit /trigger-scan to test.")

    def _handle_trigger(self):
        print("\n🚀 [BRIDGE] Trigger received!")
            
        # Use AppleScript to launch the simulator in a new terminal
        tools_dir = os.path.dirname(os.path.abspath(__file__))
        cmd = f'osascript -e \'tell application "Terminal" to do script "cd {tools_dir} && /opt/homebrew/bin/python3 usb_camera_simulator.py"\' -e \'tell application "Terminal" to activate\''
        subprocess.Popen(cmd, shell=True)
            
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status": "launched"}')

print(f"🌉 TFA Mac Bridge is active on http://localhost:{PORT}")
print("Leave this window open to allow the live website to trigger your camera.")

with socketserver.TCPServer(("", PORT), BridgeHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping bridge...")
