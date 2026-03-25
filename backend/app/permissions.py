from rest_framework.permissions import BasePermission
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class IsCustomer(BasePermission):
    """Allow access only to users with role='customer'."""
    message = 'Only customers can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'customer')


class IsManager(BasePermission):
    """Allow access only to users with role='manager'."""
    message = 'Only return managers can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'manager')


class IsOwnerOrManager(BasePermission):
    """Allow customers to access only their own objects; managers can access any."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'manager':
            return True
        # For ReturnRequest objects
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        return False


class LoginRateThrottle(AnonRateThrottle):
    rate = '10/min'
    scope = 'login'


class CreateReturnRateThrottle(UserRateThrottle):
    rate = '20/hour'
    scope = 'create_return'
