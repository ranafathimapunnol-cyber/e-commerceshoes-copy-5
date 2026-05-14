from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
import redis
import json
import os

# Connect to Redis
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification_to_admin(request):
    """
    Send real-time notification from User to Admin via Socket.IO
    """
    notification_type = request.data.get('notification_type')
    title = request.data.get('title')
    message = request.data.get('message')
    data = request.data.get('data', {})

    # Save to database
    notification = Notification.objects.create(
        user=request.user,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data
    )

    # Prepare notification data for Socket.IO
    socket_data = {
        'id': notification.id,
        'userId': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'notification_type': notification_type,
        'title': title,
        'message': message,
        'data': data,
        'created_at': notification.created_at.isoformat(),
        'is_read': False
    }

    # Publish to Redis channel (Node.js will pick this up)
    redis_client.publish('notifications', json.dumps({
        'type': 'admin_notification',
        'data': socket_data
    }))

    return Response({
        'status': 'sent',
        'notification_id': notification.id
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_notifications(request):
    """Get all notifications for admin dashboard"""
    limit = request.query_params.get('limit', 100)
    notifications = Notification.objects.all()[:int(limit)]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def mark_notification_read(request, notification_id):
    """Mark notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()

        # Notify via Redis to update other admin sessions
        redis_client.publish('notifications', json.dumps({
            'type': 'notification_read',
            'notification_id': notification_id
        }))

        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_user_update(request):
    """
    Admin sends update to specific user
    """
    user_id = request.data.get('user_id')
    title = request.data.get('title')
    message = request.data.get('message')
    data = request.data.get('data', {})

    # Save to database
    from django.contrib.auth.models import User
    user = User.objects.get(id=user_id)

    notification = Notification.objects.create(
        user=user,
        notification_type='order_update',
        title=title,
        message=message,
        data=data
    )

    # Send to user via Redis
    redis_client.publish('notifications', json.dumps({
        'type': 'user_notification',
        'user_id': user_id,
        'data': {
            'id': notification.id,
            'title': title,
            'message': message,
            'data': data,
            'created_at': notification.created_at.isoformat()
        }
    }))

    return Response({'status': 'sent'})
