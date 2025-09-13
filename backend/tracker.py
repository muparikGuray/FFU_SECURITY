import requests

def ip_lookup(ip):
    """Lookup IP address information using ipinfo.io"""
    try:
        url = f"http://ipinfo.io/{ip}/json"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to lookup IP {ip}: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}