#!/bin/sh
cd "$(dirname "$0")"
echo "VozKriolu Studio em http://localhost:8080  (Ctrl+C para parar)"
python3 -m http.server 8080 --bind 127.0.0.1
