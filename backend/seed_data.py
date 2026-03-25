import os
import django
import random
from datetime import date, timedelta
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.models import User, ReturnRequest, ReturnImage, ShippingImages, MLAnalysis, CustomerBehavior

def create_demo_data():
    print("Creating demo users...")
    customer, _ = User.objects.get_or_create(email='customer@demo.com', defaults={'name': 'Alex Johnson', 'role': 'customer'})
    if _: customer.set_password('demo123'); customer.save()
    
    manager, _ = User.objects.get_or_create(email='manager@demo.com', defaults={'name': 'Sarah Manager', 'role': 'manager'})
    if _: manager.set_password('demo123'); manager.save()
    
    print("Creating customer behavior...")
    CustomerBehavior.objects.create(
        customer=customer,
        total_orders=12,
        total_returns=2,
        return_ratio=0.16,
        previous_rejections=0,
        risk_score=15.0
    )
    
    print("Creating generic image files...")
    # Create a dummy image for testing
    dummy_img = SimpleUploadedFile(name='test_img.jpg', content=b'fake_image_data', content_type='image/jpeg')
    
    # 1. Successful Match
    print("Creating Return 1 (Safe Match)...")
    rr1 = ReturnRequest.objects.create(
        customer=customer,
        order_id="ORD-001",
        product_name="Sony Headphones",
        delivery_date=date.today() - timedelta(days=5),
        return_reason="not_working",
        description="The left speaker has static.",
        status="pending"
    )
    ReturnImage.objects.create(return_request=rr1, image=dummy_img)
    ShippingImages.objects.create(order_id="ORD-001", image_path=dummy_img, captured_at=timezone.now())
    
    # 2. Blocked due to no shipping image
    print("Creating Return 2 (No Shipping Image)...")
    rr2 = ReturnRequest.objects.create(
        customer=customer,
        order_id="ORD-002",
        product_name="Generic Smartwatch",
        delivery_date=date.today() - timedelta(days=2),
        return_reason="wrong_item",
        description="I ordered black but got red.",
        status="pending"
    )
    ReturnImage.objects.create(return_request=rr2, image=dummy_img)
    
    print("Done! Database successfully seeded!")

if __name__ == "__main__":
    create_demo_data()
