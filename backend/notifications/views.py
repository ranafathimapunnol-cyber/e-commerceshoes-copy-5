# notifications/views.py - UPDATED TO USE YOUR SERIALIZER
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer 


# =========================
# 1. GET ADMIN NOTIFICATIONS
# =========================
class GetAdminNotificationsView(ListAPIView):
    """Get all notifications for admin"""
    permission_classes = [IsAdminUser]
    serializer_class = NotificationSerializer 

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')[:100]


# =========================
# 2. MARK SINGLE NOTIFICATION AS READ
# =========================
class MarkNotificationReadView(GenericAPIView):
    """Mark a single notification as read"""
    permission_classes = [IsAdminUser]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


# =========================
# 3. MARK ALL NOTIFICATIONS AS READ
# =========================
class MarkAllNotificationsReadView(GenericAPIView):
    """Mark all notifications as read"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            updated = Notification.objects.filter(
                user=request.user, is_read=False).update(is_read=True)
            return Response({'message': f'{updated} notifications marked as read'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# 4. DELETE SINGLE NOTIFICATION
# =========================
class DeleteNotificationView(GenericAPIView):
    """PERMANENTLY delete a single notification"""
    permission_classes = [IsAdminUser]

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id, user=request.user)
            notification_id_deleted = notification.id
            notification.delete()
            print(f"✅ Deleted notification: {notification_id_deleted}")
            return Response({
                'message': 'Notification permanently deleted',
                'deleted_id': notification_id_deleted
            }, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            print(f"❌ Notification {notification_id} not found")
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"❌ Error deleting: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# 5. CLEAR ALL NOTIFICATIONS
# =========================
class ClearAllNotificationsView(GenericAPIView):
    """PERMANENTLY delete ALL notifications for current admin"""
    permission_classes = [IsAdminUser]

    def delete(self, request):
        try:
            count = Notification.objects.filter(user=request.user).count()
            deleted_count = Notification.objects.filter(
                user=request.user).delete()[0]
            print(
                f"✅ Deleted {deleted_count} notifications for {request.user.username}")
            return Response({
                'message': f'{deleted_count} notifications permanently deleted',
                'deleted_count': deleted_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"❌ Error clearing all: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# 6. TEST ENDPOINT
# =========================
class TestClearAllView(GenericAPIView):
    """Test endpoint to verify clear-all functionality"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"message": "Clear-all endpoint is accessible!"}, status=status.HTTP_200_OK)
