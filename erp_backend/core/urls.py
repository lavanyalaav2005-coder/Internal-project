from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'clients', views.ClientViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'domains', views.DomainViewSet)
router.register(r'hostings', views.HostingViewSet)
router.register(r'tickets', views.TicketViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'backups', views.BackupViewSet)
router.register(r'amc-billing', views.AMCBillingViewSet)
router.register(r'ai-alerts', views.AIAlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register),
    path('dashboard/', views.dashboard_stats),
]
