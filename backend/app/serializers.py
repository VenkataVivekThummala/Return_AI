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
            'images',
        ]


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
            'status', 'created_at', 'images', 'shipping_images', 'ml_analysis'
        ]

    def get_shipping_images(self, obj):
        shipping = ShippingImages.objects.filter(order_id=obj.order_id)
        return ShippingImageSerializer(shipping, many=True, context=self.context).data


class ManagerReturnRequestDetailSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    images = ReturnImageSerializer(many=True, read_only=True)
    shipping_images = serializers.SerializerMethodField()
    ml_analysis = MLAnalysisSerializer(read_only=True)
    customer_behavior = serializers.SerializerMethodField()

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'customer', 'order_id', 'product_name', 'delivery_date',
            'return_reason', 'description', 'status',
            'images', 'shipping_images', 'ml_analysis', 'customer_behavior',
            'created_at', 'updated_at', 'reviewed_at'
        ]

    def get_shipping_images(self, obj):
        shipping = ShippingImages.objects.filter(order_id=obj.order_id)
        return ShippingImageSerializer(shipping, many=True, context=self.context).data

    def get_customer_behavior(self, obj):
        if hasattr(obj.customer, 'behavior'):
            return CustomerBehaviorSerializer(obj.customer.behavior).data
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
