/*
  # Security Dashboard Database Schema

  1. New Tables
    - `firewall_rules`
      - `id` (uuid, primary key)
      - `name` (text)
      - `action` (text) - 'allow' or 'block'
      - `source_ip` (text)
      - `destination_ip` (text, nullable)
      - `port_range` (text)
      - `protocol` (text)
      - `priority` (integer)
      - `enabled` (boolean)
      - `description` (text, nullable)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `traffic_logs`
      - `id` (uuid, primary key)
      - `source_ip` (text)
      - `destination_ip` (text)
      - `source_port` (integer)
      - `destination_port` (integer)
      - `protocol` (text)
      - `packet_size` (integer)
      - `status` (text) - 'allowed' or 'blocked'
      - `timestamp` (timestamp)
      - `firewall_rule_id` (uuid, references firewall_rules, nullable)

    - `security_alerts`
      - `id` (uuid, primary key)
      - `threat_type` (text)
      - `severity` (text) - 'low', 'medium', 'high', 'critical'
      - `source_ip` (text)
      - `description` (text)
      - `status` (text) - 'active', 'acknowledged', 'resolved'
      - `detection_time` (timestamp)
      - `resolved_time` (timestamp, nullable)
      - `recommended_action` (text)
      - `user_id` (uuid, references auth.users)

    - `dictionary_terms`
      - `id` (uuid, primary key)
      - `term` (text)
      - `definition` (text)
      - `category` (text) - 'protocols', 'threats', 'tools', 'concepts'
      - `examples` (text, nullable)
      - `related_terms` (text array, nullable)
      - `bookmarked` (boolean)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for traffic_logs to be readable by all authenticated users (for monitoring)

  3. Indexes
    - Add performance indexes for commonly queried columns
    - Add composite indexes for filtering operations
*/

-- Create firewall_rules table
CREATE TABLE IF NOT EXISTS firewall_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  action text NOT NULL CHECK (action IN ('allow', 'block')),
  source_ip text NOT NULL,
  destination_ip text,
  port_range text NOT NULL,
  protocol text NOT NULL CHECK (protocol IN ('TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP')),
  priority integer NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 100),
  enabled boolean NOT NULL DEFAULT true,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create traffic_logs table
CREATE TABLE IF NOT EXISTS traffic_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ip text NOT NULL,
  destination_ip text NOT NULL,
  source_port integer NOT NULL CHECK (source_port >= 1 AND source_port <= 65535),
  destination_port integer NOT NULL CHECK (destination_port >= 1 AND destination_port <= 65535),
  protocol text NOT NULL CHECK (protocol IN ('TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP')),
  packet_size integer NOT NULL CHECK (packet_size > 0),
  status text NOT NULL CHECK (status IN ('allowed', 'blocked')),
  timestamp timestamptz DEFAULT now(),
  firewall_rule_id uuid REFERENCES firewall_rules(id) ON DELETE SET NULL
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  detection_time timestamptz DEFAULT now(),
  resolved_time timestamptz,
  recommended_action text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create dictionary_terms table
CREATE TABLE IF NOT EXISTS dictionary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  definition text NOT NULL,
  category text NOT NULL CHECK (category IN ('protocols', 'threats', 'tools', 'concepts')),
  examples text,
  related_terms text[],
  bookmarked boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE firewall_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_terms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for firewall_rules
CREATE POLICY "Users can manage their own firewall rules"
  ON firewall_rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for traffic_logs (readable by all authenticated users for monitoring)
CREATE POLICY "Authenticated users can read traffic logs"
  ON traffic_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert traffic logs"
  ON traffic_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can delete old traffic logs"
  ON traffic_logs
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for security_alerts
CREATE POLICY "Users can manage their own security alerts"
  ON security_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for dictionary_terms
CREATE POLICY "Users can manage their own dictionary terms"
  ON dictionary_terms
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_firewall_rules_user_id ON firewall_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_firewall_rules_enabled ON firewall_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_firewall_rules_priority ON firewall_rules(priority);

CREATE INDEX IF NOT EXISTS idx_traffic_logs_timestamp ON traffic_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_source_ip ON traffic_logs(source_ip);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_status ON traffic_logs(status);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_protocol ON traffic_logs(protocol);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_detection_time ON security_alerts(detection_time DESC);

CREATE INDEX IF NOT EXISTS idx_dictionary_terms_user_id ON dictionary_terms(user_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_terms_category ON dictionary_terms(category);
CREATE INDEX IF NOT EXISTS idx_dictionary_terms_bookmarked ON dictionary_terms(bookmarked);
CREATE INDEX IF NOT EXISTS idx_dictionary_terms_term ON dictionary_terms(term);

-- Insert some sample security alerts for demonstration
DO $$
BEGIN
  -- Only insert if no alerts exist yet
  IF NOT EXISTS (SELECT 1 FROM security_alerts LIMIT 1) THEN
    INSERT INTO security_alerts (threat_type, severity, source_ip, description, recommended_action, user_id) 
    SELECT 
      'Port Scan Detection',
      'high',
      '192.168.1.100',
      'Multiple connection attempts detected from source IP scanning common ports (22, 80, 443, 8080). This behavior is indicative of reconnaissance activity.',
      'Block the source IP address and monitor for additional suspicious activity from the same network range.',
      auth.uid()
    WHERE auth.uid() IS NOT NULL;

    INSERT INTO security_alerts (threat_type, severity, source_ip, description, recommended_action, user_id)
    SELECT
      'Brute Force Login Attempt',
      'critical',
      '10.0.0.50',
      'Over 100 failed login attempts detected within 5 minutes from the same source IP. This indicates a brute force attack against user credentials.',
      'Immediately block the source IP, force password resets for targeted accounts, and implement rate limiting.',
      auth.uid()
    WHERE auth.uid() IS NOT NULL;

    INSERT INTO security_alerts (threat_type, severity, source_ip, description, recommended_action, user_id)
    SELECT
      'Suspicious DNS Query',
      'medium',
      '172.16.0.25',
      'DNS queries to known malicious domains detected. The source IP may be compromised and communicating with command and control servers.',
      'Investigate the source system for malware, update antivirus definitions, and consider network isolation.',
      auth.uid()
    WHERE auth.uid() IS NOT NULL;

    INSERT INTO security_alerts (threat_type, severity, source_ip, description, recommended_action, user_id)
    SELECT
      'Unusual Traffic Pattern',
      'low',
      '192.168.1.200',
      'Abnormal outbound traffic volume detected during non-business hours. This could indicate data exfiltration or unauthorized activity.',
      'Review user activity logs and monitor data transfer patterns. Verify if legitimate business activity.',
      auth.uid()
    WHERE auth.uid() IS NOT NULL;
  END IF;
END
$$;

-- Insert some sample traffic logs for demonstration
DO $$
BEGIN
  -- Only insert if no traffic logs exist yet
  IF NOT EXISTS (SELECT 1 FROM traffic_logs LIMIT 1) THEN
    -- Insert sample traffic logs with varying timestamps over the last 24 hours
    INSERT INTO traffic_logs (source_ip, destination_ip, source_port, destination_port, protocol, packet_size, status, timestamp)
    VALUES 
      ('192.168.1.100', '8.8.8.8', 51234, 53, 'UDP', 64, 'allowed', now() - interval '1 hour'),
      ('192.168.1.101', '1.1.1.1', 52341, 53, 'UDP', 72, 'allowed', now() - interval '2 hours'),
      ('10.0.0.50', '192.168.1.1', 45123, 22, 'TCP', 128, 'blocked', now() - interval '3 hours'),
      ('192.168.1.200', '172.217.14.110', 58432, 443, 'HTTPS', 1024, 'allowed', now() - interval '4 hours'),
      ('172.16.0.25', '192.168.1.10', 61234, 80, 'HTTP', 512, 'allowed', now() - interval '5 hours'),
      ('192.168.1.150', '8.8.4.4', 49876, 53, 'UDP', 68, 'allowed', now() - interval '6 hours'),
      ('10.0.0.75', '192.168.1.5', 33445, 8080, 'TCP', 256, 'blocked', now() - interval '7 hours'),
      ('192.168.1.105', '104.16.132.229', 54321, 443, 'HTTPS', 2048, 'allowed', now() - interval '8 hours'),
      ('172.16.0.100', '192.168.1.20', 42069, 21, 'TCP', 192, 'blocked', now() - interval '9 hours'),
      ('192.168.1.175', '151.101.193.140', 56789, 443, 'HTTPS', 1500, 'allowed', now() - interval '10 hours');
  END IF;
END
$$;