from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
import json
from datetime import datetime

# Import utility modules
from sniffer import start_sniffing, stop_sniffing, get_captured_packets, clear_packets
from tracker import ip_lookup
from scanner import run_scan
from firewall import add_rule, get_rules

app = FastAPI(title="Security Dashboard API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class FirewallRuleCreate(BaseModel):
    name: str
    action: str
    source_ip: str
    destination_ip: Optional[str] = None
    port_range: str
    protocol: str
    priority: int
    enabled: bool = True
    description: Optional[str] = None

class FirewallRuleUpdate(BaseModel):
    name: Optional[str] = None
    action: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    port_range: Optional[str] = None
    protocol: Optional[str] = None
    priority: Optional[int] = None
    enabled: Optional[bool] = None
    description: Optional[str] = None

class IPLookupRequest(BaseModel):
    ip: str

class ScanRequest(BaseModel):
    ip: str

# Global state for packet capture
capture_state = {
    "is_capturing": False,
    "packets": []
}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Security Dashboard API", "status": "running"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Firewall endpoints
@app.get("/api/firewall/rules")
async def get_firewall_rules():
    """Get all firewall rules"""
    try:
        rules_data = get_rules()
        # Transform the data to match frontend expectations
        rules = []
        for i, rule in enumerate(rules_data.get("firewall_rules", [])):
            rules.append({
                "id": str(i + 1),
                "name": f"Rule {i + 1}",
                "action": rule.get("action", "allow"),
                "source_ip": rule.get("ip", "0.0.0.0"),
                "destination_ip": "any",
                "port_range": "any",
                "protocol": "TCP",
                "priority": i + 1,
                "enabled": True,
                "description": f"Rule for {rule.get('ip', 'unknown')}",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "user_id": "demo-user"
            })
        return {"rules": rules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/firewall/rules")
async def create_firewall_rule(rule: FirewallRuleCreate):
    """Create a new firewall rule"""
    try:
        # Add rule using the firewall utility
        result = add_rule(rule.source_ip, rule.action)
        
        # Return the created rule with additional metadata
        new_rule = {
            "id": str(len(get_rules()["firewall_rules"])),
            "name": rule.name,
            "action": rule.action,
            "source_ip": rule.source_ip,
            "destination_ip": rule.destination_ip or "any",
            "port_range": rule.port_range,
            "protocol": rule.protocol,
            "priority": rule.priority,
            "enabled": rule.enabled,
            "description": rule.description,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "user_id": "demo-user"
        }
        
        return {"rule": new_rule, "message": "Rule created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/firewall/rules/{rule_id}")
async def update_firewall_rule(rule_id: str, rule: FirewallRuleUpdate):
    """Update an existing firewall rule"""
    try:
        # In a real implementation, you'd update the specific rule
        # For now, we'll return a success response
        return {"message": f"Rule {rule_id} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/firewall/rules/{rule_id}")
async def delete_firewall_rule(rule_id: str):
    """Delete a firewall rule"""
    try:
        # In a real implementation, you'd delete the specific rule
        return {"message": f"Rule {rule_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Packet sniffer endpoints
@app.post("/api/sniffer/start")
async def start_packet_capture():
    """Start packet capture"""
    try:
        if not capture_state["is_capturing"]:
            # Start sniffing in background
            asyncio.create_task(capture_packets_background())
            capture_state["is_capturing"] = True
            return {"message": "Packet capture started", "status": "capturing"}
        else:
            return {"message": "Packet capture already running", "status": "capturing"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sniffer/stop")
async def stop_packet_capture():
    """Stop packet capture"""
    try:
        if capture_state["is_capturing"]:
            stop_sniffing()
            capture_state["is_capturing"] = False
            return {"message": "Packet capture stopped", "status": "stopped"}
        else:
            return {"message": "Packet capture not running", "status": "stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sniffer/status")
async def get_capture_status():
    """Get packet capture status"""
    return {
        "is_capturing": capture_state["is_capturing"],
        "packet_count": len(capture_state["packets"])
    }

@app.get("/api/sniffer/packets")
async def get_packets():
    """Get captured packets"""
    try:
        # Get packets from the sniffer utility
        packets = get_captured_packets()
        
        # Transform packets to match frontend expectations
        formatted_packets = []
        for i, packet in enumerate(packets):
            formatted_packets.append({
                "id": str(i + 1),
                "source_ip": packet.get("src", "unknown"),
                "destination_ip": packet.get("dst", "unknown"),
                "source_port": packet.get("sport", 0),
                "destination_port": packet.get("dport", 0),
                "protocol": packet.get("proto", "TCP"),
                "packet_size": packet.get("len", 0),
                "status": "allowed",  # Default status
                "timestamp": datetime.now().isoformat(),
                "firewall_rule_id": None
            })
        
        return {"packets": formatted_packets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/sniffer/packets")
async def clear_captured_packets():
    """Clear all captured packets"""
    try:
        clear_packets()
        capture_state["packets"] = []
        return {"message": "Packets cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# IP lookup endpoint
@app.post("/api/lookup/ip")
async def lookup_ip(request: IPLookupRequest):
    """Lookup IP address information"""
    try:
        result = ip_lookup(request.ip)
        return {"ip": request.ip, "info": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Network scanner endpoint
@app.post("/api/scanner/scan")
async def scan_network(request: ScanRequest):
    """Scan network for open ports"""
    try:
        result = run_scan(request.ip)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard metrics endpoint
@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics"""
    try:
        packets = get_captured_packets()
        total_bandwidth = sum(p.get("len", 0) for p in packets)
        unique_ips = len(set(p.get("src", "") for p in packets))
        
        return {
            "totalBandwidth": total_bandwidth // (1024 * 1024),  # Convert to MB
            "activeConnections": unique_ips,
            "blockedThreats": 0,  # Would be calculated based on firewall rules
            "uptime": "99.9%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Security alerts endpoint
@app.get("/api/alerts")
async def get_security_alerts():
    """Get security alerts"""
    try:
        # In a real implementation, this would analyze traffic patterns
        # and generate alerts based on suspicious activity
        alerts = []
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def capture_packets_background():
    """Background task to capture packets"""
    try:
        start_sniffing()
    except Exception as e:
        print(f"Error in packet capture: {e}")
        capture_state["is_capturing"] = False

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)