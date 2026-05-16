from rest_framework import serializers
from .models import Client, Project, Domain, Hosting, Ticket, Notification, Backup, AMCBilling, AIAlert


class ClientSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    open_tickets = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_project_count(self, obj):
        return obj.projects.count()

    def get_open_tickets(self, obj):
        return obj.tickets.filter(status__in=['open', 'in_progress']).count()


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'


class DomainSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)
    days_until_expiry = serializers.SerializerMethodField()

    class Meta:
        model = Domain
        fields = '__all__'

    def get_days_until_expiry(self, obj):
        return obj.days_until_expiry()


class HostingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = Hosting
        fields = '__all__'


class TicketSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    is_sla_breached = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = '__all__'

    def get_is_sla_breached(self, obj):
        return obj.is_sla_breached()


class NotificationSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'


class BackupSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = Backup
        fields = '__all__'


class AMCBillingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = AMCBilling
        fields = '__all__'


class AIAlertSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = AIAlert
        fields = '__all__'
