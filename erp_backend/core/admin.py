from django.contrib import admin
from .models import Client, Project, Domain, Hosting, Ticket, Notification, Backup, AMCBilling, AIAlert

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'contact_person', 'email', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['company_name', 'email']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'client', 'status', 'health_score', 'created_at']
    list_filter = ['status']

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain_name', 'client', 'expiry_date', 'status']
    list_filter = ['status']

@admin.register(Hosting)
class HostingAdmin(admin.ModelAdmin):
    list_display = ['provider', 'client', 'hosting_type', 'expiry_date', 'status']

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'priority', 'status', 'created_at']
    list_filter = ['priority', 'status', 'category']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'notification_type', 'channel', 'status']

@admin.register(Backup)
class BackupAdmin(admin.ModelAdmin):
    list_display = ['client', 'backup_type', 'status', 'size_mb', 'started_at']

@admin.register(AMCBilling)
class AMCBillingAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'amount', 'due_date', 'status']

@admin.register(AIAlert)
class AIAlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'severity', 'is_resolved', 'created_at']
