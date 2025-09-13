rules = []

def add_rule(ip, action):
    """Add a new firewall rule"""
    rule = {"ip": ip, "action": action}
    rules.append(rule)
    return {"status": "rule added", "rule": rule}

def get_rules():
    """Get all firewall rules"""
    return {"firewall_rules": rules}

def update_rule(rule_id, updates):
    """Update an existing firewall rule"""
    try:
        if 0 <= rule_id < len(rules):
            rules[rule_id].update(updates)
            return {"status": "rule updated", "rule": rules[rule_id]}
        else:
            return {"status": "error", "message": "Rule not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_rule(rule_id):
    """Delete a firewall rule"""
    try:
        if 0 <= rule_id < len(rules):
            deleted_rule = rules.pop(rule_id)
            return {"status": "rule deleted", "rule": deleted_rule}
        else:
            return {"status": "error", "message": "Rule not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def clear_rules():
    """Clear all firewall rules"""
    global rules
    rules = []
    return {"status": "all rules cleared"}