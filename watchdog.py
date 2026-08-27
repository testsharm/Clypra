#!/usr/bin/env python3
import socket
import subprocess
import time
import datetime

PORT = 3002
CHECK_INTERVAL = 40  # seconds
LOG_FILE = "watchdog.log"
SERVER_CMD = ["node", "executor-server.cjs"]
SERVER_LOG = open("executor.log", "a")

process = None

def log(msg):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def is_server_up():
    try:
        with socket.create_connection(("0.0.0.0", PORT), timeout=3):
            return True
    except OSError:
        return False

def start_server():
    global process
    log("Starting executor-server.cjs ...")
    process = subprocess.Popen(SERVER_CMD, stdout=SERVER_LOG, stderr=SERVER_LOG)
    time.sleep(3)
    if is_server_up():
        log("Server started successfully and is responding on port " + str(PORT))
    else:
        log("Server process started but is NOT responding yet on port " + str(PORT))

def main():
    log("Watchdog started. Checking every " + str(CHECK_INTERVAL) + " seconds.")
    if is_server_up():
        log("Server already running on port " + str(PORT))
    else:
        start_server()

    while True:
        time.sleep(CHECK_INTERVAL)
        if is_server_up():
            log("Status check: OK - server is up on port " + str(PORT))
        else:
            log("Status check: DOWN - server not responding. Restarting...")
            if process is not None and process.poll() is None:
                process.kill()
            start_server()

if __name__ == "__main__":
    main()
