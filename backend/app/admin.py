from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ReturnRequest, ReturnImage, ShippingImages, MLAnalysis, CustomerBehavior

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'name']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'password1', 'password2'),
        }),
    )

@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'order_id', 'product_name', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['order_id', 'product_name', 'customer__name']

@admin.register(ReturnImage)
class ReturnImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'return_request', 'uploaded_at']

@admin.register(ShippingImages)
class ShippingImagesAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_id', 'captured_at']
    search_fields = ['order_id']

@admin.register(MLAnalysis)
class MLAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'return_request', 'similarity_score', 'damage_level', 'customer_risk_score']

@admin.register(CustomerBehavior)
class CustomerBehaviorAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'total_orders', 'total_returns', 'risk_score']
