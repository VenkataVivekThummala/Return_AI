from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.get_me, name='get-me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Customer Returns
    path('create-return/', views.create_return, name='create-return'),
    path('my-returns/', views.my_returns, name='my-returns'),
    path('return/<int:pk>/', views.return_detail, name='return-detail'),
    path('return/<int:pk>/delete/', views.delete_return, name='delete-return'),

    # Manager Returns
    path('manager/returns/', views.all_returns, name='all-returns'),
    path('manager/return/<int:pk>/', views.return_detail, name='manager-return-detail'),
    path('manager/update-status/<int:pk>/', views.update_status, name='update-status'),
    path('manager/run-ml/<int:pk>/', views.run_ml, name='run-ml'),

    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('manager/return/<int:pk>/upload-shipping-image/', views.upload_shipping_image, name='upload-shipping-image'),
    path('manager/shipping-image/<int:image_id>/', views.delete_shipping_image, name='delete-shipping-image'),

    # Delivery Boy
    path('delivery/login/', views.delivery_login, name='delivery-login'),
    path('delivery/pickups/', views.delivery_pickups, name='delivery-pickups'),
    path('delivery/update-status/<int:pk>/', views.update_pickup_status, name='update-pickup-status'),
]
