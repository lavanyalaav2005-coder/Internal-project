from django.db import models
from django.utils import timezone


class Client(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('suspended', 'Suspended')]
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    contract_start = models.DateField(null=True, blank=True)
    contract_end = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name

    class Meta:
        ordering = ['-created_at']


class Project(models.Model):
    STATUS_CHOICES = [('planning', 'Planning'), ('development', 'Development'),
                      ('testing', 'Testing'), ('delivered', 'Delivered'), ('maintenance', 'Maintenance')]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    tech_stack = models.CharField(max_length=300, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='development')
    start_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    health_score = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.client.company_name})"

    class Meta:
        ordering = ['-created_at']


class Domain(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('expiring_soon', 'Expiring Soon'),
                      ('expired', 'Expired'), ('transferred', 'Transferred')]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='domains')
    domain_name = models.CharField(max_length=200)
    registrar = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField()
    ssl_expiry = models.DateField(null=True, blank=True)
    ssl_issuer = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    auto_renew = models.BooleanField(default=True)
    dns_provider = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def days_until_expiry(self):
        return (self.expiry_date - timezone.now().date()).days

    def __str__(self):
        return self.domain_name

    class Meta:
        ordering = ['expiry_date']


class Hosting(models.Model):
    TYPE_CHOICES = [('shared', 'Shared'), ('vps', 'VPS'), ('dedicated', 'Dedicated'),
                    ('cloud', 'Cloud'), ('managed', 'Managed')]
    STATUS_CHOICES = [('active', 'Active'), ('expiring_soon', 'Expiring Soon'),
                      ('expired', 'Expired'), ('suspended', 'Suspended')]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='hostings')
    provider = models.CharField(max_length=100)
    hosting_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='cloud')
    server_ip = models.GenericIPAddressField(null=True, blank=True)
    datacenter = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    cpu_usage = models.FloatField(default=0)
    memory_usage = models.FloatField(default=0)
    disk_usage = models.FloatField(default=0)
    uptime_percentage = models.FloatField(default=99.9)
    monthly_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.provider} - {self.client.company_name}"

    class Meta:
        ordering = ['expiry_date']


class Ticket(models.Model):
    PRIORITY_CHOICES = [('critical', 'Critical'), ('high', 'High'), ('medium', 'Medium'), ('low', 'Low')]
    STATUS_CHOICES = [('open', 'Open'), ('in_progress', 'In Progress'),
                      ('resolved', 'Resolved'), ('closed', 'Closed'), ('escalated', 'Escalated')]
    CATEGORY_CHOICES = [('bug', 'Bug'), ('feature', 'Feature Request'), ('performance', 'Performance'),
                        ('security', 'Security'), ('billing', 'Billing'), ('general', 'General')]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='tickets')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    title = models.CharField(max_length=300)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    assigned_to = models.CharField(max_length=100, blank=True)
    sla_response_hours = models.IntegerField(default=4)
    sla_resolution_hours = models.IntegerField(default=24)
    response_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_sla_breached(self):
        if self.status in ['open', 'in_progress']:
            elapsed = (timezone.now() - self.created_at).total_seconds() / 3600
            return elapsed > self.sla_resolution_hours
        return False

    def __str__(self):
        return f"#{self.id} - {self.title}"

    class Meta:
        ordering = ['-created_at']


class Notification(models.Model):
    TYPE_CHOICES = [('domain_expiry', 'Domain Expiry'), ('hosting_expiry', 'Hosting Expiry'),
                    ('ssl_expiry', 'SSL Expiry'), ('invoice_due', 'Invoice Due'),
                    ('maintenance', 'Maintenance'), ('backup', 'Backup'), ('security', 'Security Alert'),
                    ('sla_breach', 'SLA Breach'), ('general', 'General')]
    CHANNEL_CHOICES = [('email', 'Email'), ('sms', 'SMS'), ('whatsapp', 'WhatsApp'), ('app', 'App')]
    STATUS_CHOICES = [('pending', 'Pending'), ('sent', 'Sent'), ('failed', 'Failed'), ('read', 'Read')]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='email')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    scheduled_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)
    is_ai_generated = models.BooleanField(default=False)
    priority = models.CharField(max_length=20, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type} - {self.client.company_name}"

    class Meta:
        ordering = ['-created_at']


class Backup(models.Model):
    STATUS_CHOICES = [('success', 'Success'), ('failed', 'Failed'), ('in_progress', 'In Progress'), ('pending', 'Pending')]
    TYPE_CHOICES = [('full', 'Full'), ('incremental', 'Incremental'), ('differential', 'Differential')]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='backups')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    backup_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    size_mb = models.FloatField(default=0)
    location = models.CharField(max_length=300, blank=True)
    retention_days = models.IntegerField(default=30)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"Backup {self.backup_type} - {self.client.company_name}"

    class Meta:
        ordering = ['-started_at']


class AMCBilling(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('due', 'Due'), ('overdue', 'Overdue'),
                      ('paid', 'Paid'), ('cancelled', 'Cancelled')]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='amc_billings')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    description = models.TextField(blank=True)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.client.company_name}"

    class Meta:
        ordering = ['-created_at']


class AIAlert(models.Model):
    SEVERITY_CHOICES = [('critical', 'Critical'), ('warning', 'Warning'), ('info', 'Info')]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='ai_alerts')
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    prediction_confidence = models.FloatField(default=0.85)
    is_resolved = models.BooleanField(default=False)
    recommended_action = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Alert: {self.title}"

    class Meta:
        ordering = ['-created_at']
