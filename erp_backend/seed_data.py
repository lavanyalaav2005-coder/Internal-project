import os
import django
import sys
sys.path.insert(0, '/home/claude/erp_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta
from core.models import Client, Project, Domain, Hosting, Ticket, Notification, Backup, AMCBilling, AIAlert

# Superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@erp.com', 'admin123')
    print("Created superuser: admin / admin123")

# Clients
clients_data = [
    {'company_name': 'TechCorp Solutions', 'contact_person': 'Arjun Mehta', 'email': 'arjun@techcorp.in', 'phone': '+91-9876543210', 'status': 'active', 'address': 'Mumbai, Maharashtra'},
    {'company_name': 'GlobalRetail Ltd', 'contact_person': 'Priya Sharma', 'email': 'priya@globalretail.com', 'phone': '+91-9988776655', 'status': 'active', 'address': 'Delhi, India'},
    {'company_name': 'StartupHub Inc', 'contact_person': 'Rahul Kumar', 'email': 'rahul@startuphub.io', 'phone': '+91-9123456789', 'status': 'active', 'address': 'Bangalore, Karnataka'},
    {'company_name': 'FinancePro Group', 'contact_person': 'Sunita Patel', 'email': 'sunita@financepro.co', 'phone': '+91-7845123690', 'status': 'inactive', 'address': 'Chennai, Tamil Nadu'},
    {'company_name': 'EduTech Academy', 'contact_person': 'Vikram Singh', 'email': 'vikram@edutech.edu', 'phone': '+91-9654123780', 'status': 'active', 'address': 'Pune, Maharashtra'},
]
clients = []
for cd in clients_data:
    c, _ = Client.objects.get_or_create(email=cd['email'], defaults={**cd, 'contract_start': date.today() - timedelta(days=180), 'contract_end': date.today() + timedelta(days=185)})
    clients.append(c)

# Projects
projects_data = [
    (clients[0], 'E-Commerce Platform', 'Full-stack e-commerce solution', 'React, Django, PostgreSQL', 'delivered', 95),
    (clients[0], 'CRM Mobile App', 'Customer relationship mobile app', 'React Native, Node.js', 'maintenance', 88),
    (clients[1], 'Inventory Management System', 'Warehouse tracking system', 'Vue.js, Django, MySQL', 'delivered', 92),
    (clients[2], 'SaaS Dashboard', 'Analytics dashboard platform', 'React, FastAPI, MongoDB', 'development', 75),
    (clients[4], 'LMS Portal', 'Learning management system', 'React, Django, SQLite', 'testing', 85),
]
projects = []
for pd in projects_data:
    p, _ = Project.objects.get_or_create(client=pd[0], name=pd[1], defaults={'description': pd[2], 'tech_stack': pd[3], 'status': pd[4], 'health_score': pd[5], 'start_date': date.today() - timedelta(days=90), 'delivery_date': date.today() + timedelta(days=30)})
    projects.append(p)

# Domains
domains_data = [
    (clients[0], 'techcorp.in', 'GoDaddy', date.today() + timedelta(days=15), date.today() + timedelta(days=45), 'expiring_soon'),
    (clients[0], 'shop.techcorp.in', 'Namecheap', date.today() + timedelta(days=120), date.today() + timedelta(days=90), 'active'),
    (clients[1], 'globalretail.com', 'GoDaddy', date.today() + timedelta(days=5), date.today() + timedelta(days=10), 'expiring_soon'),
    (clients[2], 'startuphub.io', 'Cloudflare', date.today() + timedelta(days=200), date.today() + timedelta(days=180), 'active'),
    (clients[4], 'edutech.edu', 'HostGator', date.today() - timedelta(days=3), None, 'expired'),
]
for dd in domains_data:
    Domain.objects.get_or_create(client=dd[0], domain_name=dd[1], defaults={'registrar': dd[2], 'expiry_date': dd[3], 'ssl_expiry': dd[4], 'status': dd[5], 'ssl_issuer': "Let's Encrypt"})

# Hostings
hostings_data = [
    (clients[0], 'AWS', 'cloud', '54.12.34.56', 'ap-south-1', date.today() + timedelta(days=30), 65.2, 72.5, 45.8, 99.95, 150),
    (clients[1], 'DigitalOcean', 'vps', '138.68.45.23', 'Bangalore', date.today() + timedelta(days=10), 42.1, 58.3, 38.2, 99.80, 48),
    (clients[2], 'Google Cloud', 'cloud', '34.89.123.45', 'us-central1', date.today() + timedelta(days=180), 28.5, 41.2, 22.4, 99.99, 90),
    (clients[4], 'Azure', 'managed', '20.44.56.78', 'East US', date.today() + timedelta(days=75), 55.8, 68.9, 51.3, 99.90, 200),
]
hostings = []
for hd in hostings_data:
    h, _ = Hosting.objects.get_or_create(client=hd[0], provider=hd[1], defaults={'hosting_type': hd[2], 'server_ip': hd[3], 'datacenter': hd[4], 'expiry_date': hd[5], 'cpu_usage': hd[6], 'memory_usage': hd[7], 'disk_usage': hd[8], 'uptime_percentage': hd[9], 'monthly_cost': hd[10]})
    hostings.append(h)

# Tickets
tickets_data = [
    (clients[0], projects[0], 'Payment gateway timeout', 'Users experiencing 30s timeout on checkout', 'critical', 'in_progress', 'security', 'Ravi Kumar', 1, 4),
    (clients[0], projects[1], 'Push notification delay', 'iOS push notifications delayed by 5 minutes', 'high', 'open', 'bug', 'Neha Joshi', 2, 8),
    (clients[1], projects[2], 'Inventory report export slow', 'Excel export taking over 2 minutes', 'medium', 'in_progress', 'performance', 'Suresh Babu', 4, 24),
    (clients[2], projects[3], 'Dashboard charts not loading', 'Charts show empty on first load', 'high', 'open', 'bug', '', 2, 8),
    (clients[4], projects[4], 'Video streaming buffering', 'High resolution videos buffering on 4G', 'medium', 'open', 'performance', '', 4, 24),
    (clients[0], None, 'Invoice discrepancy Q1', 'Invoice amount mismatch for March', 'low', 'open', 'billing', '', 8, 48),
]
for td in tickets_data:
    Ticket.objects.get_or_create(client=td[0], title=td[2], defaults={'project': td[1], 'description': td[3], 'priority': td[4], 'status': td[5], 'category': td[6], 'assigned_to': td[7], 'sla_response_hours': td[8], 'sla_resolution_hours': td[9]})

# Notifications
notifs_data = [
    (clients[0], 'domain_expiry', '⚠️ Domain Expiring Soon', 'techcorp.in expires in 15 days. Renew immediately.', 'email', 'sent', True, 'high'),
    (clients[1], 'hosting_expiry', '🚨 Hosting Expiry Alert', 'DigitalOcean hosting expires in 10 days.', 'whatsapp', 'pending', True, 'critical'),
    (clients[2], 'ssl_expiry', '🔒 SSL Certificate Reminder', 'SSL cert for startuphub.io expires in 180 days.', 'email', 'sent', False, 'low'),
    (clients[4], 'domain_expiry', '❌ Domain Expired', 'edutech.edu has expired! Renew immediately.', 'sms', 'sent', True, 'critical'),
    (clients[0], 'invoice_due', '💰 Invoice Due', 'Invoice #INV-2024-003 for ₹45,000 is due in 7 days.', 'email', 'pending', False, 'medium'),
]
for nd in notifs_data:
    Notification.objects.get_or_create(client=nd[0], title=nd[2], defaults={'notification_type': nd[1], 'message': nd[3], 'channel': nd[4], 'status': nd[5], 'is_ai_generated': nd[6], 'priority': nd[7]})

# Backups
backups_data = [
    (clients[0], projects[0], 'full', 'success', 2048.5, 'AWS S3 us-east-1/techcorp/2024-01-15', timezone.now() - timedelta(hours=6)),
    (clients[0], projects[1], 'incremental', 'success', 128.3, 'AWS S3 us-east-1/techcorp/mobile/2024-01-15', timezone.now() - timedelta(hours=12)),
    (clients[1], projects[2], 'full', 'failed', 0, 'DO Spaces/globalretail/2024-01-15', timezone.now() - timedelta(hours=3)),
    (clients[2], projects[3], 'incremental', 'success', 56.7, 'GCS bucket/startuphub/2024-01-15', timezone.now() - timedelta(hours=1)),
    (clients[4], projects[4], 'full', 'in_progress', 0, 'Azure Blob/edutech/2024-01-15', timezone.now() - timedelta(minutes=30)),
]
for bd in backups_data:
    Backup.objects.get_or_create(client=bd[0], started_at=bd[6], defaults={'project': bd[1], 'backup_type': bd[2], 'status': bd[3], 'size_mb': bd[4], 'location': bd[5], 'retention_days': 30})

# AMC Billing
amc_data = [
    (clients[0], projects[0], 'INV-2024-001', 85000, date.today() - timedelta(days=30), date.today() - timedelta(days=25), 'paid'),
    (clients[0], projects[1], 'INV-2024-002', 45000, date.today() + timedelta(days=7), None, 'due'),
    (clients[1], projects[2], 'INV-2024-003', 65000, date.today() - timedelta(days=5), None, 'overdue'),
    (clients[2], projects[3], 'INV-2024-004', 120000, date.today() + timedelta(days=30), None, 'active'),
    (clients[4], projects[4], 'INV-2024-005', 55000, date.today() + timedelta(days=15), None, 'active'),
]
for ad in amc_data:
    AMCBilling.objects.get_or_create(invoice_number=ad[2], defaults={'client': ad[0], 'project': ad[1], 'amount': ad[3], 'due_date': ad[4], 'paid_date': ad[5], 'status': ad[6], 'description': 'Annual Maintenance Contract'})

# AI Alerts
alerts_data = [
    (clients[0], 'CPU Spike Predicted', 'CPU usage predicted to exceed 90% in next 4 hours based on traffic patterns', 'warning', 0.87, 'Scale up your EC2 instance type or enable auto-scaling'),
    (clients[1], 'Database Connection Pool Exhaustion', 'Connection pool will be exhausted by 6 PM today', 'critical', 0.93, 'Increase max_connections in PostgreSQL config'),
    (clients[2], 'Unusual Login Pattern', 'Multiple failed logins from IP 192.168.x.x detected', 'warning', 0.78, 'Enable 2FA and review access logs'),
    (clients[0], 'SSL Certificate Renewal', 'SSL cert auto-renewal may fail due to DNS misconfiguration', 'warning', 0.82, 'Verify DNS TXT records for domain validation'),
    (clients[4], 'Backup Job Failure Risk', 'Storage quota at 95%, backup may fail tonight', 'critical', 0.91, 'Increase storage or clean old backups immediately'),
]
for ad in alerts_data:
    AIAlert.objects.get_or_create(client=ad[0], title=ad[1], defaults={'description': ad[2], 'severity': ad[3], 'prediction_confidence': ad[4], 'recommended_action': ad[5]})

print("✅ Seed data created successfully!")
print("Login: admin / admin123")
