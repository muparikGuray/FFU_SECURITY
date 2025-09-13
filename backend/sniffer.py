from scapy.all import sniff, IP, TCP, UDP
import threading
import time

# Global variables for packet capture
captured_packets = []
capture_thread = None
is_sniffing = False

def packet_handler(packet):
    """Handle captured packets"""
    global captured_packets
    
    if IP in packet:
        packet_info = {
            "src": packet[IP].src,
            "dst": packet[IP].dst,
            "len": len(packet),
            "proto": "IP"
        }
        
        if TCP in packet:
            packet_info.update({
                "sport": packet[TCP].sport,
                "dport": packet[TCP].dport,
                "proto": "TCP"
            })
        elif UDP in packet:
            packet_info.update({
                "sport": packet[UDP].sport,
                "dport": packet[UDP].dport,
                "proto": "UDP"
            })
        
        captured_packets.append(packet_info)
        
        # Keep only last 1000 packets to prevent memory issues
        if len(captured_packets) > 1000:
            captured_packets = captured_packets[-1000:]

def start_sniffing():
    """Start packet sniffing"""
    global capture_thread, is_sniffing
    
    if not is_sniffing:
        is_sniffing = True
        capture_thread = threading.Thread(target=sniff_packets)
        capture_thread.daemon = True
        capture_thread.start()

def sniff_packets():
    """Sniff packets in a separate thread"""
    global is_sniffing
    
    try:
        # Sniff packets on all interfaces
        sniff(prn=packet_handler, stop_filter=lambda x: not is_sniffing, timeout=1)
    except Exception as e:
        print(f"Error in packet sniffing: {e}")
        is_sniffing = False

def stop_sniffing():
    """Stop packet sniffing"""
    global is_sniffing
    is_sniffing = False

def get_captured_packets():
    """Get all captured packets"""
    return captured_packets.copy()

def clear_packets():
    """Clear all captured packets"""
    global captured_packets
    captured_packets = []

def get_sniffing_status():
    """Get current sniffing status"""
    return is_sniffing