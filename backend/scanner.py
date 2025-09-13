import nmap

def run_scan(ip):
    """Scan IP address for open ports"""
    try:
        scanner = nmap.PortScanner()
        scanner.scan(ip, '20-1000')
        
        result = []
        for host in scanner.all_hosts():
            for proto in scanner[host].all_protocols():
                ports = scanner[host][proto].keys()
                for port in ports:
                    state = scanner[host][proto][port]['state']
                    result.append({"port": port, "state": state})
        
        return {"ip": ip, "open_ports": result}
    except Exception as e:
        return {"ip": ip, "error": f"Scan failed: {str(e)}", "open_ports": []}