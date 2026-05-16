from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta, date
from .models import Client, Project, Domain, Hosting, Ticket, Notification, Backup, AMCBilling, AIAlert
from .serializers import (ClientSerializer, ProjectSerializer, DomainSerializer,
                           HostingSerializer, TicketSerializer, NotificationSerializer,
                           BackupSerializer, AMCBillingSerializer, AIAlertSerializer)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message': 'User created successfully', 'id': user.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = date.today()
    thirty_days = today + timedelta(days=30)

    total_clients = Client.objects.count()
    active_clients = Client.objects.filter(status='active').count()
    expiring_domains = Domain.objects.filter(expiry_date__lte=thirty_days, expiry_date__gte=today).count()
    expired_domains = Domain.objects.filter(expiry_date__lt=today).count()
    open_tickets = Ticket.objects.filter(status__in=['open', 'in_progress']).count()
    critical_tickets = Ticket.objects.filter(priority='critical', status__in=['open', 'in_progress']).count()
    total_revenue = AMCBilling.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    pending_invoices = AMCBilling.objects.filter(status__in=['due', 'overdue']).aggregate(total=Sum('amount'))['total'] or 0
    unresolved_alerts = AIAlert.objects.filter(is_resolved=False).count()
    recent_backups = Backup.objects.filter(started_at__gte=timezone.now() - timedelta(days=7)).count()
    failed_backups = Backup.objects.filter(status='failed', started_at__gte=timezone.now() - timedelta(days=7)).count()

    # Ticket trend last 7 days
    ticket_trend = []
    for i in range(7):
        d = today - timedelta(days=6-i)
        count = Ticket.objects.filter(created_at__date=d).count()
        ticket_trend.append({'date': d.strftime('%b %d'), 'tickets': count})

    # SLA breach count
    sla_breached = sum(1 for t in Ticket.objects.filter(status__in=['open', 'in_progress']) if t.is_sla_breached())

    return Response({
        'total_clients': total_clients,
        'active_clients': active_clients,
        'expiring_domains': expiring_domains,
        'expired_domains': expired_domains,
        'open_tickets': open_tickets,
        'critical_tickets': critical_tickets,
        'total_revenue': float(total_revenue),
        'pending_invoices': float(pending_invoices),
        'unresolved_alerts': unresolved_alerts,
        'recent_backups': recent_backups,
        'failed_backups': failed_backups,
        'sla_breached': sla_breached,
        'ticket_trend': ticket_trend,
    })


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(company_name__icontains=search) | Q(email__icontains=search))
        return qs


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('client').all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs


class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.select_related('client').all()
    serializer_class = DomainSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        today = date.today()
        expiring = self.request.query_params.get('expiring')
        if expiring:
            days = int(expiring)
            qs = qs.filter(expiry_date__lte=today + timedelta(days=days), expiry_date__gte=today)
        return qs


class HostingViewSet(viewsets.ModelViewSet):
    queryset = Hosting.objects.select_related('client').all()
    serializer_class = HostingSerializer


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('client', 'project').all()
    serializer_class = TicketSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        if status:
            qs = qs.filter(status=status)
        if priority:
            qs = qs.filter(priority=priority)
        return qs

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'resolved'
        ticket.resolved_at = timezone.now()
        ticket.save()
        return Response({'message': 'Ticket resolved'})

    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'escalated'
        ticket.priority = 'critical'
        ticket.save()
        return Response({'message': 'Ticket escalated'})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related('client').all()
    serializer_class = NotificationSerializer

    @action(detail=True, methods=['post'])
    def mark_sent(self, request, pk=None):
        notif = self.get_object()
        notif.status = 'sent'
        notif.sent_at = timezone.now()
        notif.save()
        return Response({'message': 'Marked as sent'})


class BackupViewSet(viewsets.ModelViewSet):
    queryset = Backup.objects.select_related('client').all()
    serializer_class = BackupSerializer


class AMCBillingViewSet(viewsets.ModelViewSet):
    queryset = AMCBilling.objects.select_related('client').all()
    serializer_class = AMCBillingSerializer


class AIAlertViewSet(viewsets.ModelViewSet):
    queryset = AIAlert.objects.select_related('client').all()
    serializer_class = AIAlertSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.is_resolved = True
        alert.save()
        return Response({'message': 'Alert resolved'})
