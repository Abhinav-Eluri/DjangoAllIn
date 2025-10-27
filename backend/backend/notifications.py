# myapp/notifications.py
from generic_notifications.types import NotificationType, register

@register
class CommentNotification(NotificationType):
    key = "comment"
    name = "Comment Notifications"
    description = "When someone comments on your posts"
