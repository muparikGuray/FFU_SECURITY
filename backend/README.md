# Security Dashboard Backend API

A Python FastAPI backend that provides network security monitoring capabilities including packet sniffing, port scanning, IP lookup, and firewall management.

## Features

- **Packet Sniffing**: Real-time network traffic capture and analysis
- **Port Scanning**: Network reconnaissance using nmap
- **IP Lookup**: Geolocation and network information lookup
- **Firewall Management**: Rule creation, modification, and deletion
- **Dashboard Metrics**: Real-time security metrics and analytics

## Requirements

- Python 3.8+
- Root/Administrator privileges (for packet capture)
- Network interface access

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. For packet capture functionality, you may need additional system packages:

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-dev libpcap-dev
```

**macOS:**
```bash
brew install libpcap
```

**Windows:**
- Install Npcap from https://npcap.com/

## Usage

### Quick Start

```bash
# Start the API server
python start.py

# Or run directly with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### API Endpoints

The API will be available at `http://localhost:8000` with the following endpoints:

#### Firewall Management
- `GET /api/firewall/rules` - Get all firewall rules
- `POST /api/firewall/rules` - Create a new firewall rule
- `PUT /api/firewall/rules/{rule_id}` - Update a firewall rule
- `DELETE /api/firewall/rules/{rule_id}` - Delete a firewall rule

#### Packet Sniffing
- `POST /api/sniffer/start` - Start packet capture
- `POST /api/sniffer/stop` - Stop packet capture
- `GET /api/sniffer/status` - Get capture status
- `GET /api/sniffer/packets` - Get captured packets
- `DELETE /api/sniffer/packets` - Clear captured packets

#### Network Tools
- `POST /api/lookup/ip` - Lookup IP address information
- `POST /api/scanner/scan` - Scan network for open ports

#### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/alerts` - Get security alerts

### API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Security Considerations

- **Packet Capture**: Requires elevated privileges (root/administrator)
- **Network Scanning**: May trigger security alerts on monitored networks
- **CORS**: Currently configured for development (localhost origins)
- **Rate Limiting**: Not implemented - consider adding for production use

## Development

### Project Structure

```
backend/
├── main.py          # FastAPI application and routes
├── sniffer.py       # Packet capture functionality
├── scanner.py       # Network port scanning
├── tracker.py       # IP geolocation lookup
├── firewall.py      # Firewall rule management
├── requirements.txt # Python dependencies
├── start.py         # Server startup script
└── README.md        # This file
```

### Adding New Features

1. Create utility functions in appropriate modules
2. Add API endpoints in `main.py`
3. Update the frontend API client in `src/lib/pythonApi.ts`
4. Test the integration

## Troubleshooting

### Common Issues

1. **Permission Denied (Packet Capture)**
   - Run with elevated privileges: `sudo python start.py`
   - On Windows, run as Administrator

2. **Port Already in Use**
   - Change the port in `start.py` or kill the existing process

3. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`

4. **Network Interface Issues**
   - Check available interfaces with `ip addr` (Linux) or `ipconfig` (Windows)
   - Modify sniffer.py to specify the correct interface

### Logs and Debugging

- Enable debug logging by setting `--log-level debug` in uvicorn
- Check console output for error messages
- Use the `/health` endpoint to verify API status

## Production Deployment

For production deployment, consider:

1. **Security**: Implement authentication and authorization
2. **HTTPS**: Use SSL/TLS certificates
3. **Rate Limiting**: Add request rate limiting
4. **Monitoring**: Implement logging and monitoring
5. **Database**: Replace in-memory storage with persistent database
6. **Containerization**: Use Docker for consistent deployment

## License

This project is for educational and authorized security testing purposes only.