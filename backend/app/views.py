from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, ReturnRequest, ReturnImage, ShippingImages, MLAnalysis, CustomerBehavior, PickupRequest
from .serializers import (
    UserRegisterSerializer, UserSerializer,
    CustomerReturnRequestSerializer, CustomerCreateReturnSerializer,
    ManagerReturnRequestListSerializer, ManagerReturnRequestDetailSerializer,
    ManagerUpdateStatusSerializer, PickupRequestSerializer
)
import sys
import os

# Ensure ml_models is reachable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_models.ml_service import process_return_ml


# ─────────────────────────────────────────────
# Auth Views
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'error': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    return Response(UserSerializer(request.user).data)


# ─────────────────────────────────────────────
# Return Request Views
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_return(request):
    if request.user.role != 'customer':
        return Response({'error': 'Only customers can create return requests'},
                        status=status.HTTP_403_FORBIDDEN)

    serializer = CustomerCreateReturnSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 1. Strip ML processing entirely. Customer sees no ML data.
    validated = serializer.validated_data

    # Create the return request (pending)
    return_request = ReturnRequest.objects.create(
        customer=request.user,
        order_id=validated['order_id'],
        product_name=validated['product_name'],
        delivery_date=validated['delivery_date'],
        return_reason=validated['return_reason'],
        description=validated['description'],
        status='pending',
    )

    # Save images
    images = request.FILES.getlist('images')
    for img_file in images:
        ReturnImage.objects.create(
            return_request=return_request,
            image=img_file,
        )

    return Response(
        CustomerReturnRequestSerializer(return_request, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_returns(request):
    if request.user.role != 'customer':
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    queryset = ReturnRequest.objects.filter(customer=request.user).prefetch_related('images')
    serializer = CustomerReturnRequestSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_returns(request):
    if request.user.role != 'manager':
        return Response({'error': 'Only managers can access all returns'},
                        status=status.HTTP_403_FORBIDDEN)

    status_filter = request.query_params.get('status')
    queryset = ReturnRequest.objects.all().select_related('customer', 'ml_analysis').prefetch_related('images')

    if status_filter:
        queryset = queryset.filter(status=status_filter)

    serializer = ManagerReturnRequestListSerializer(queryset, many=True, context={'request': request})

    # Stats
    all_qs = ReturnRequest.objects.all()
    stats = {
        'total': all_qs.count(),
        'pending': all_qs.filter(status='pending').count(),
        'under_review': all_qs.filter(status='under_review').count(),
        'accepted': all_qs.filter(status='accepted').count(),
        'rejected': all_qs.filter(status='rejected').count(),
    }

    return Response({'returns': serializer.data, 'stats': stats})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def return_detail(request, pk):
    return_request = get_object_or_404(ReturnRequest, pk=pk)

    # Customers can only see their own - and only see clean Customer serialized data
    if request.user.role == 'customer':
        if return_request.customer != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CustomerReturnRequestSerializer(return_request, context={'request': request})
    else:
        serializer = ManagerReturnRequestDetailSerializer(return_request, context={'request': request})

    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_status(request, pk):
    if request.user.role != 'manager':
        return Response({'error': 'Only managers can update status'},
                        status=status.HTTP_403_FORBIDDEN)

    return_request = get_object_or_404(ReturnRequest, pk=pk)
    serializer = ManagerUpdateStatusSerializer(return_request, data=request.data, partial=True)
    if serializer.is_valid():
        from django.utils import timezone
        serializer.save(reviewed_at=timezone.now())
        return Response(
            ManagerReturnRequestDetailSerializer(return_request, context={'request': request}).data
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_ml(request, pk):
    if request.user.role != 'manager':
        return Response({'error': 'Only managers can trigger ML analysis'},
                        status=status.HTTP_403_FORBIDDEN)

    return_request = get_object_or_404(ReturnRequest, pk=pk)
    
    # Delegate to the newly created ml_service module
    try:
        result = process_return_ml(return_request)
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        # Reload to get the new ml_analysis
        return_request.refresh_from_db()
        return Response(ManagerReturnRequestDetailSerializer(return_request, context={'request': request}).data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    if request.user.role != 'manager':
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    all_qs = ReturnRequest.objects.all()

    return Response({
        'total': all_qs.count(),
        'pending': all_qs.filter(status='pending').count(),
        'under_review': all_qs.filter(status='under_review').count(),
        'accepted': all_qs.filter(status='accepted').count(),
        'rejected': all_qs.filter(status='rejected').count(),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_shipping_image(request, pk):
    if request.user.role != 'manager':
        return Response({'error': 'Only managers can upload shipping baseline images'},
                        status=status.HTTP_403_FORBIDDEN)

    return_request = get_object_or_404(ReturnRequest, pk=pk)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
    image_file = request.FILES['image']
    from django.utils import timezone
    ShippingImages.objects.create(
        order_id=return_request.order_id,
        image_path=image_file,
        captured_at=timezone.now()
    )
    
    return Response(ManagerReturnRequestDetailSerializer(return_request, context={'request': request}).data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_shipping_image(request, image_id):
    if request.user.role != 'manager':
        return Response({'error': 'Only managers can delete shipping baseline images'},
                        status=status.HTTP_403_FORBIDDEN)

    shipping_image = get_object_or_404(ShippingImages, pk=image_id)
    shipping_image.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_return(request, pk):
    return_request = get_object_or_404(ReturnRequest, pk=pk)
    
    # Check permissions
    if request.user.role == 'customer':
        if return_request.customer != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    elif request.user.role == 'manager':
        pass # Managers can delete any request
    else:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
    return_request.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ─────────────────────────────────────────────
# Delivery Boy Views
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def delivery_login(request):
    delivery_id = request.data.get('delivery_id', '').strip()
    password = request.data.get('password', '')

    try:
        user = User.objects.get(delivery_id=delivery_id)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password) or user.role != 'delivery':
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'error': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def delivery_pickups(request):
    if request.user.role != 'delivery':
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    queryset = PickupRequest.objects.filter(assigned_delivery_boy=request.user)
    # They should only see pickups where the manager approved the return.
    # The return_request.status must be 'accepted'
    queryset = queryset.filter(return_request__status='accepted')

    serializer = PickupRequestSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_pickup_status(request, pk):
    if request.user.role != 'delivery':
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    pickup = get_object_or_404(PickupRequest, pk=pk, assigned_delivery_boy=request.user)
    
    new_status = request.data.get('status')
    failure_reason = request.data.get('failure_reason', '')

    if new_status not in dict(PickupRequest.STATUS_CHOICES):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    pickup.pickup_status = new_status
    if new_status == 'failed':
        pickup.failure_reason = failure_reason
        
    pickup.save()
    
    # If pickup is successful, we might want to update the ReturnRequest status too or notify manager.
    # For now, just update the pickup.

    return Response(PickupRequestSerializer(pickup, context={'request': request}).data)
