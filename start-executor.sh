#!/bin/bash
# Ensure we are in the project root
cd "$(dirname "$0")"

while true; do
  # Kill any existing process on 3002
  fuser -k 3002/tcp || true
  
  echo "$(date): Starting executor-server.cjs" >> executor.log
  node executor-server.cjs >> executor.log 2>&1
  
  echo "$(date): Server crashed or exited, restarting in 2 seconds..." >> executor.log
  sleep 2
done
