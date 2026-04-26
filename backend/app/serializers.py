from rest_framework import serializers
from .models import User, ReturnRequest, ReturnImage, ShippingImages, MLAnalysis, CustomerBehavior

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'customer'),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'created_at']


class ReturnImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ReturnImage
        fields = ['id', 'image_url', 'uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class ShippingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ShippingImages
        fields = ['id', 'order_id', 'image_url', 'captured_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.image_path:
            return request.build_absolute_uri(obj.image_path.url)
        return None


class MLAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLAnalysis
        fields = '__all__'


class CustomerBehaviorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerBehavior
        fields = '__all__'


# ---------------------------------------------------------
# CUSTOMER FACING SERIALIZERS (STRICT SECURITY RULE: NO ML)
# ---------------------------------------------------------

class CustomerReturnRequestSerializer(serializers.ModelSerializer):
    """Customer view of a return - absolutely ZERO ML fields"""
    images = ReturnImageSerializer(many=True, read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'order_id', 'product_name', 'delivery_date',
            'return_reason', 'description', 'status', 'created_at',
            'images', 'pickup_details',
        ]

    pickup_details = serializers.SerializerMethodField()

    def get_pickup_details(self, obj):
        if hasattr(obj, 'pickup'):
            return {
                'status': obj.pickup.pickup_status,
                'failure_reason': obj.pickup.failure_reason,
                'agent_name': obj.pickup.assigned_delivery_boy.name if obj.pickup.assigned_delivery_boy else None
            }
        return None


class CustomerCreateReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnRequest
        fields = ['order_id', 'product_name', 'delivery_date', 'return_reason', 'description']

    def validate_delivery_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Delivery date cannot be in the future.")
        return value


# ---------------------------------------------------------
# MANAGER FACING SERIALIZERS
# ---------------------------------------------------------

class ManagerReturnRequestListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    images = ReturnImageSerializer(many=True, read_only=True)
    shipping_images = serializers.SerializerMethodField()
    ml_analysis = MLAnalysisSerializer(read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'customer_name', 'customer_email', 'order_id', 'product_name',
            'status', 'created_at', 'images', 'shipping_images', 'ml_analysis', 'pickup_status', 'pickup_failure_reason'
        ]

    pickup_status = serializers.SerializerMethodField()
    pickup_failure_reason = serializers.SerializerMethodField()

    def get_pickup_status(self, obj):
        if hasattr(obj, 'pickup'):
            return obj.pickup.pickup_status
        return None

    def get_pickup_failure_reason(self, obj):
        if hasattr(obj, 'pickup'):
            return obj.pickup.failure_reason
        return None

    def get_shipping_images(self, obj):
        shipping = ShippingImages.objects.filter(order_id=obj.order_id)
        return ShippingImageSerializer(shipping, many=True, context=self.context).data


class ManagerReturnRequestDetailSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    images = ReturnImageSerializer(many=True, read_only=True)
    shipping_images = serializers.SerializerMethodField()
    ml_analysis = MLAnalysisSerializer(read_only=True)
    customer_behavior = serializers.SerializerMethodField()
    pickup_details = serializers.SerializerMethodField()

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'customer', 'order_id', 'product_name', 'delivery_date',
            'return_reason', 'description', 'status',
            'images', 'shipping_images', 'ml_analysis', 'customer_behavior', 'pickup_details',
            'created_at', 'updated_at', 'reviewed_at'
        ]

    def get_shipping_images(self, obj):
        shipping = ShippingImages.objects.filter(order_id=obj.order_id)
        return ShippingImageSerializer(shipping, many=True, context=self.context).data

    def get_customer_behavior(self, obj):
        if hasattr(obj.customer, 'behavior'):
            return CustomerBehaviorSerializer(obj.customer.behavior).data
        return None

    def get_pickup_details(self, obj):
        if hasattr(obj, 'pickup'):
            return {
                'status': obj.pickup.pickup_status,
                'failure_reason': obj.pickup.failure_reason,
                'agent_name': obj.pickup.assigned_delivery_boy.name if obj.pickup.assigned_delivery_boy else None
            }
        return None


class ManagerUpdateStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnRequest
        fields = ['status']

    def validate_status(self, value):
        allowed = ['pending', 'under_review', 'accepted', 'rejected']
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {allowed}")
        return value

# ---------------------------------------------------------
# DELIVERY BOY FACING SERIALIZERS
# ---------------------------------------------------------

from .models import PickupRequest

class PickupRequestSerializer(serializers.ModelSerializer):
    order_id = serializers.CharField(source='return_request.order_id', read_only=True)
    customer_name = serializers.CharField(source='return_request.customer.name', read_only=True)
    customer_address = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='return_request.product_name', read_only=True)
    return_reason = serializers.CharField(source='return_request.return_reason', read_only=True)
    manager_status = serializers.CharField(source='return_request.status', read_only=True)
    customer_uploaded_images = serializers.SerializerMethodField()
    system_reference_images = serializers.SerializerMethodField()
    pickup_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PickupRequest
        fields = [
            'id', 'order_id', 'customer_name', 'customer_address', 'product_name', 
            'return_reason', 'manager_status', 'pickup_status', 'failure_reason',
            'customer_uploaded_images', 'system_reference_images', 'pickup_image_url',
            'assigned_at', 'updated_at'
        ]

    def get_customer_address(self, obj):
        # We don't have an address field yet, so we return a dummy address
        return f"123 Main St, Springfield, IL (Customer #{obj.return_request.customer.id})"
        
    def get_customer_uploaded_images(self, obj):
        images = ReturnImage.objects.filter(return_request=obj.return_request)
        return ReturnImageSerializer(images, many=True, context=self.context).data
        
    def get_system_reference_images(self, obj):
        images = ShippingImages.objects.filter(order_id=obj.return_request.order_id)
        return ShippingImageSerializer(images, many=True, context=self.context).data
        
    def get_pickup_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.pickup_image:
            return request.build_absolute_uri(obj.pickup_image.url)
        return None
