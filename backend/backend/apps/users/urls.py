# from rest_framework.routers import DefaultRouter
# from .views import UserViewSet
from django.urls import path
from .views import (
    
    RegisterView, 
    LoginView, 
    GoogleOAuthView, 
    # SSOLoginView,
    UserDetailView, 
    ChangePasswordView, 
    UploadAvatarView,
    TwoStepSetupView,
    TwoStepVerifyView,
    SendOTPView,
    VerifyOTPView,
    ResetPasswordRequestView
# path('users/sso/', SSOLoginView.as_view(), name='sso-login'),
)
# router = DefaultRouter()
# router.register(r'', UserViewSet, basename='user')
# urlpatterns = router.urls

urlpatterns = [
    path('users/register/', RegisterView.as_view(), name='user-register'),
    path('users/login/', LoginView.as_view(), name='login'),
    path('users/google/', GoogleOAuthView.as_view(), name='google-oauth'),
    path('users/<int:id>/detail/', UserDetailView.as_view(), name='user-detail'),
    path('users/<int:id>/password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/<int:id>/avatar/', UploadAvatarView.as_view(), name='upload-avatar'),
    path('2step/setup/', TwoStepSetupView.as_view(), name='auth-2step-setup'),
    path('send-otp/', SendOTPView.as_view(), name='auth-send-otp'),
    path('2step/verify/', TwoStepVerifyView.as_view(), name='auth-2step-verify'),
    path('verify-otp/', VerifyOTPView.as_view(), name='auth-verify-otp'),
    path('reset-password/', ResetPasswordRequestView.as_view(), name='auth-reset-password'),   
]