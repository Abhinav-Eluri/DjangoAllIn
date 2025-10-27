from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone

from generic_notifications.channels import WebsiteChannel
from generic_notifications.models import Notification


class NotificationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    # GET /api/notifications/unread_count/
    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = Notification.objects.for_channel(WebsiteChannel).filter(
            recipient=request.user, read__isnull=True
        ).count()
        return Response({"unread_count": count})

    # GET /api/notifications/unread/
    @action(detail=False, methods=["get"])
    def unread(self, request):
        notifications = Notification.objects.for_channel(WebsiteChannel).filter(
            recipient=request.user, read__isnull=True
        ).select_related('actor').order_by('-added')
        data = [
            {
                "id": n.id,
                "subject": n.subject,
                "text": n.text,
                "url": n.url,
                "created_at": n.added,
                "is_read": n.read is not None,
                "sender": {
                    "id": n.actor.id if n.actor else None,
                    "name": f"{n.actor.first_name} {n.actor.last_name}".strip() if n.actor else "System",
                    "email": n.actor.email if n.actor else None,
                } if n.actor else {"id": None, "name": "System", "email": None},
            }
            for n in notifications
        ]
        return Response(data)

    # GET /api/notifications/
    def list(self, request):
        notifications = Notification.objects.for_channel(WebsiteChannel).filter(
            recipient=request.user
        ).select_related('actor').order_by('-added')
        
        # Apply filter
        filter_param = request.query_params.get('filter', 'all')
        if filter_param == 'read':
            notifications = notifications.filter(read__isnull=False)
        elif filter_param == 'unread':
            notifications = notifications.filter(read__isnull=True)
        # 'all' doesn't need additional filtering
        
        # Apply pagination
        paginator = NotificationPagination()
        page = paginator.paginate_queryset(notifications, request)
        
        data = [
            {
                "id": n.id,
                "subject": n.subject,
                "text": n.text,
                "url": n.url,
                "created_at": n.added,
                "is_read": n.read is not None,
                "sender": {
                    "id": n.actor.id if n.actor else None,
                    "name": f"{n.actor.first_name} {n.actor.last_name}".strip() if n.actor else "System",
                    "email": n.actor.email if n.actor else None,
                } if n.actor else {"id": None, "name": "System", "email": None},
            }
            for n in page
        ]
        
        return paginator.get_paginated_response(data)

    # POST /api/notifications/mark_all_read/
    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        Notification.objects.for_channel(WebsiteChannel).filter(
            recipient=request.user, read__isnull=True
        ).update(read=timezone.now())
        return Response({"message": "All notifications marked as read"})

    # POST /api/notifications/clear_all/
    @action(detail=False, methods=["post"])
    def clear_all(self, request):
        Notification.objects.for_channel(WebsiteChannel).filter(
            recipient=request.user
        ).delete()
        return Response({"message": "All notifications cleared"})

    # POST /api/notifications/bulk_actions/
    @action(detail=False, methods=["post"])
    def bulk_actions(self, request):
        action_type = request.data.get('action')
        notification_ids = request.data.get('notification_ids', [])
        
        if not action_type or not notification_ids:
            return Response(
                {"error": "action and notification_ids are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = Notification.objects.for_channel(WebsiteChannel).filter(
            id__in=notification_ids, recipient=request.user
        )
        
        if action_type == 'mark_read':
            notifications.update(read=timezone.now())
            return Response({"message": f"{notifications.count()} notifications marked as read"})
        elif action_type == 'mark_unread':
            notifications.update(read=None)
            return Response({"message": f"{notifications.count()} notifications marked as unread"})
        elif action_type == 'delete':
            count = notifications.count()
            notifications.delete()
            return Response({"message": f"{count} notifications deleted"})
        else:
            return Response(
                {"error": "Invalid action. Use 'mark_read', 'mark_unread', or 'delete'"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # POST /api/notifications/{id}/mark_read/
    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        try:
            notification = Notification.objects.for_channel(WebsiteChannel).get(
                id=pk, recipient=request.user
            )
            notification.read = timezone.now()
            notification.save()
            return Response({"message": "notification marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

    # POST /api/notifications/{id}/mark_unread/
    @action(detail=True, methods=["post"])
    def mark_unread(self, request, pk=None):
        try:
            notification = Notification.objects.for_channel(WebsiteChannel).get(
                id=pk, recipient=request.user
            )
            notification.read = None
            notification.save()
            return Response({"message": "notification marked as unread"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

    # DELETE /api/notifications/{id}/
    def destroy(self, request, pk=None):
        try:
            notification = Notification.objects.for_channel(WebsiteChannel).get(
                id=pk, recipient=request.user
            )
            notification.delete()
            return Response({"message": "notification deleted"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
