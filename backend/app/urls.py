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

    # Manager Returns
    path('manager/returns/', views.all_returns, name='all-returns'),
    path('manager/return/<int:pk>/', views.return_detail, name='manager-return-detail'),
    path('manager/update-status/<int:pk>/', views.update_status, name='update-status'),
    path('manager/run-ml/<int:pk>/', views.run_ml, name='run-ml'),

    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('manager/return/<int:pk>/upload-shipping-image/', views.upload_shipping_image, name='upload-shipping-image'),
]
