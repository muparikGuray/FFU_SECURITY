#!/usr/bin/env python3
"""
Start script for the Security Dashboard Backend API
"""

import sys
import os
import subprocess
import signal
import time

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import scapy
        import nmap
        import requests
        print("✓ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please install dependencies with: pip install -r requirements.txt")
        return False

def check_permissions():
    """Check if running with appropriate permissions for packet capture"""
    if os.name == 'posix':  # Unix/Linux/macOS
        if os.geteuid() != 0:
            print("⚠️  Warning: Running without root privileges")
            print("   Packet capture may not work properly")
            print("   Consider running with: sudo python start.py")
    return True

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Security Dashboard Backend API...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("🔄 Press Ctrl+C to stop the server")
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main function"""
    print("🔒 Security Dashboard Backend API")
    print("=" * 40)
    
    if not check_dependencies():
        sys.exit(1)
    
    check_permissions()
    start_server()

if __name__ == "__main__":
    main()