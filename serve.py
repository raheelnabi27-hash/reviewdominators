"""Simple static dev server.

    py serve.py            # http://localhost:4300
    py serve.py 8080
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4300

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler)
    print(f"Serving on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
