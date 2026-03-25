from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role='customer'):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password, role='manager')
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('manager', 'Return Manager'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return f"{self.name} ({self.role})"


class ReturnRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    REASON_CHOICES = [
        ('delivery_damaged', 'Delivery Damaged'),
        ('not_working', 'Not Working'),
        ('wrong_item', 'Wrong Item'),
        ('other', 'Other'),
    ]

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='return_requests')
    order_id = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255)
    delivery_date = models.DateField()
    return_reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Return #{self.id} - {self.product_name} ({self.status})"


class ReturnImage(models.Model):
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='customer_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for Return #{self.return_request.id}"


class ShippingImages(models.Model):
    order_id = models.CharField(max_length=100, db_index=True)
    image_path = models.ImageField(upload_to='shipping_images/')
    captured_at = models.DateTimeField()

    def __str__(self):
        return f"Shipping image for {self.order_id}"


class MLAnalysis(models.Model):
    return_request = models.OneToOneField(ReturnRequest, on_delete=models.CASCADE, related_name='ml_analysis')
    similarity_score = models.FloatField(null=True, blank=True)
    similarity_prediction = models.CharField(max_length=100, null=True, blank=True)
    damage_level = models.CharField(max_length=50, null=True, blank=True)
    damage_probability = models.FloatField(null=True, blank=True)
    customer_risk_score = models.FloatField(null=True, blank=True)
    model_used = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ML Analysis for Return #{self.return_request.id}"


class CustomerBehavior(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='behavior')
    total_orders = models.IntegerField(default=0)
    total_returns = models.IntegerField(default=0)
    return_ratio = models.FloatField(default=0.0)
    previous_rejections = models.IntegerField(default=0)
    risk_score = models.FloatField(default=0.0)

    def __str__(self):
        return f"Behavior Stats for {self.customer.email}"
