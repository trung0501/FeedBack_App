import logging
import random
import uuid
# from apps.users.models import User
from django.shortcuts import render
from django.conf import settings
from django.core.mail import send_mail
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .models import User
from .serializers import UserRegisterSerializer
from .serializers import UserDetailSerializer
from .serializers import LoginSerializer
from .serializers import GoogleOAuthSerializer
from .serializers import ChangePasswordSerializer
from .serializers import UploadAvatarSerializer
from .serializers import TwoStepVerifySerializer
from .serializers import SendOTPSerializer
from .serializers import VerifyOTPSerializer
from .serializers import ResetPasswordRequestSerializer

# Create your views here.
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

# Đăng ký người dùng mới
class RegisterView(APIView): 
    def post(self, request):
        email = request.data.get("email", "").strip()
        logger.info("[REGISTER] Nhận yêu cầu đăng ký với email=%s", email)

        try:
            # Kiểm tra email đã tồn tại chưa
            if User.objects.filter(email__iexact=email).exists():
                logger.warning("[REGISTER] Email %s đã tồn tại", email)
                return Response({"error": "Email đã được sử dụng"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Tạo user mới
            serializer = UserRegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                # TẠO TOKEN CHO USER
                refresh = RefreshToken.for_user(user)
                
                # TẠO USER DATA ĐỂ TRẢ VỀ
                user_data = {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'avatar_url': user.avatar_url.url if user.avatar_url else None,
                    'auth_type': user.auth_type,
                    'two_stept_auth': user.two_stept_auth,
                    'created_day': user.created_day.isoformat(),
                }
                
                logger.info("[REGISTER] Tạo user thành công (id=%s, email=%s)",
                            user.id, user.email)
                
                # TRẢ VỀ USER + TOKEN
                return Response({
                    "user": user_data,
                    "token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "message": "Đăng ký thành công"
                }, status=status.HTTP_201_CREATED)
            else:
                logger.warning("[REGISTER] Dữ liệu không hợp lệ: %s", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("[REGISTER] Lỗi hệ thống khi đăng ký email=%s: %s", email, str(e))
            return Response({"error": f"Lỗi khi đăng ký: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Đăng nhập
# class LoginView(APIView):
#     def post(self, request):
#         logger.info(" [LOGIN] Request received at %s", request.path)

#         # 1. Lấy dữ liệu đầu vào
#         email = request.data.get("email")
#         password = request.data.get("password")
#         logger.debug(" Input email: %s", email)  

#         # 2. Kiểm tra dữ liệu có đủ không
#         if not email or not password:
#             logger.warning(" Thiếu email hoặc mật khẩu ")
#             return Response({"error": "Yêu cầu email và mật khẩu"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # 3. Tìm user theo email
#             try:
#                 user = User.objects.get(email=email)
#                 logger.info(" Tìm thấy người dùng: id=%s, email=%s", user.id, user.email)
#             except User.DoesNotExist:
#                 logger.error(" Không tìm thấy email người dùng: %s", email)
#                 return Response({"error": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)
            
#             # 4. Kiểm tra mật khẩu
#             if not check_password(password, user.password):
#                 logger.error(" Mật khẩu sai id=%s", user.id)
#                 return Response({"error": "Thông tin không hợp lệ"}, status=status.HTTP_401_UNAUTHORIZED)

#             # 5. Tạo JWT token
#             refresh = RefreshToken.for_user(user)
#             logger.info(" Người dùng đăng nhập thành công id=%s", user.id)

#             return Response({
#                 "message": "Đăng nhập thành công",
#                 "access": str(refresh.access_token),
#                 "refresh": str(refresh),
#                 "user_id": user.id
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.exception(" Ngoại lệ trong quá trình đăng nhập ")
#             return Response({"error": "Lỗi máy chủ nội bộ"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        logger.info(" [LOGIN] Request received at %s", request.path)

        # 1. Lấy dữ liệu đầu vào
        email = request.data.get("email", "").strip()  # Thêm strip()
        password = request.data.get("password", "")
        logger.debug(" Input email: %s", email)  

        # 2. Kiểm tra dữ liệu có đủ không
        if not email or not password:
            logger.warning(" Thiếu email hoặc mật khẩu ")
            return Response({"error": "Yêu cầu email và mật khẩu"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        try:
            # 3. Tìm user theo email 
            try:
                user = User.objects.get(email__iexact=email)  
                logger.info(" Tìm thấy người dùng: id=%s, email=%s", user.id, user.email)
            except User.DoesNotExist:
                logger.error(" Không tìm thấy email người dùng: %s", email)
                return Response({"error": "Email hoặc mật khẩu không đúng"}, 
                              status=status.HTTP_401_UNAUTHORIZED)  
            
            # 4. Kiểm tra mật khẩu
            if not user.check_password(password):
                logger.error(" Mật khẩu sai id=%s", user.id)
                return Response({"error": "Email hoặc mật khẩu không đúng"}, 
                              status=status.HTTP_401_UNAUTHORIZED)

            # 5. Tạo JWT token và user data
            refresh = RefreshToken.for_user(user)
            
            # TẠO USER DATA ĐỂ TRẢ VỀ (GIỐNG REGISTER)
            user_data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'avatar_url': user.avatar_url.url if user.avatar_url else None,
                'auth_type': user.auth_type,
                'two_stept_auth': user.two_stept_auth,
                'created_day': user.created_day.isoformat(),
            }
            
            logger.info(" Người dùng đăng nhập thành công id=%s", user.id)

            return Response({
                "user": user_data,  
                "token": str(refresh.access_token),  
                "refresh_token": str(refresh),  
                "message": "Đăng nhập thành công"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(" Ngoại lệ trong quá trình đăng nhập ")
            return Response({"error": "Lỗi máy chủ nội bộ"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Đăng nhập bằng google oauth2
class GoogleOAuthView(APIView):
   def post(self, request):
        logger.info("[GOOGLE OAUTH] Nhận yêu cầu đăng nhập qua Google OAuth2: %s", request.data)

        serializer = GoogleOAuthSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("[GOOGLE OAUTH] Dữ liệu không hợp lệ: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        access_token = serializer.validated_data['access_token']
        logger.info("[GOOGLE OAUTH] Đang xác thực access_token với Google...")

        try:
            # Xác thực token với Google
            idinfo = id_token.verify_oauth2_token(access_token, google_requests.Request())
            email = idinfo.get('email')
            logger.info("[GOOGLE OAUTH] Token hợp lệ, email=%s", email)

            # Tìm hoặc tạo user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email.split('@')[0]}
            )
            if created:
                logger.info("[GOOGLE OAUTH] Tạo user mới từ Google email=%s", email)
            else:
                logger.info("[GOOGLE OAUTH] Đăng nhập user đã tồn tại email=%s", email)

            # Trả về JWT
            refresh = RefreshToken.for_user(user)
            logger.info("[GOOGLE OAUTH] Cấp JWT cho user id=%s, email=%s", user.id, user.email)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.warning("[GOOGLE OAUTH] Token không hợp lệ: %s", str(e))
            return Response({'error': 'Token không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.exception("[GOOGLE OAUTH] Lỗi hệ thống khi xác thực Google OAuth2: %s", str(e))
            return Response({'error': 'Lỗi hệ thống khi xác thực Google'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
        
   
# class SSOLoginView(APIView):
#     def post(self, request):
#         # Xử lý đăng nhập qua SAML SSO      
#         return Response({'message': 'SSO logic here'}, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    # Lấy thông tin người dùng
    def get(self, request, id):
        logger.info("[USER DETAIL] Nhận yêu cầu lấy thông tin người dùng id=%s", id)

        try:
            user = get_object_or_404(User, id=id)
            serializer = UserDetailSerializer(user)
            logger.info("[USER DETAIL] Tìm thấy người dùng: id=%s, email=%s", user.id, user.email)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[USER DETAIL] Lỗi hệ thống khi lấy thông tin người dùng id=%s: %s", id, str(e))
            return Response({"error": "Lỗi khi lấy thông tin người dùng"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

    # Cập nhật thông tin người dùng
    def get(self, request, id):
        logger.info("[USER DETAIL] Nhận yêu cầu lấy thông tin người dùng id=%s", id)

        try:
            user = User.objects.filter(id=id).first()
            if not user:
                logger.warning("[USER DETAIL] Không tìm thấy người dùng với id=%s", id)
                return Response({"error": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

            serializer = UserDetailSerializer(user)
            logger.info("[USER DETAIL] Tìm thấy người dùng: id=%s, email=%s", user.id, user.email)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[USER DETAIL] Lỗi hệ thống khi lấy thông tin người dùng id=%s: %s", id, str(e))
            return Response({"error": "Lỗi khi lấy thông tin người dùng"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Xóa thông tin người dùng
    def delete(self, request, id):
        logger.info("[USER DELETE] Yêu cầu xoá người dùng", id)
        try:
            user = get_object_or_404(User, id=id)
            email = user.email
            user.delete()
            logger.info("[USER DELETE] Đã xoá người dùng id=%s, email=%s", id, email)
            return Response({"message": "Xoá người dùng thành công"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("[USER DELETE] Lỗi khi xoá id=%s: %s", id, str(e))
            return Response({"error": f"Lỗi khi xoá người dùng: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Xử lý đổi mật khẩu
class ChangePasswordView(APIView):
    def put(self, request, id):    
        logger.info("[CHANGE PASSWORD] Yêu cầu đổi mật khẩu", id)
        try:
            user = get_object_or_404(User, id=id)
            serializer = ChangePasswordSerializer(data=request.data)

            if not serializer.is_valid():
                logger.warning("[CHANGE PASSWORD] Dữ liệu không hợp lệ khi đổi mật khẩu user id=%s: %s",
                               id, serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                logger.warning("[CHANGE PASSWORD] Sai mật khẩu cũ cho user id=%s", id)
                return Response({"message": "Mật khẩu cũ không đúng"},
                                status=status.HTTP_401_UNAUTHORIZED)

            user.set_password(new_password)
            user.save()
            logger.info("[CHANGE PASSWORD] Đổi mật khẩu thành công cho user id=%s, email=%s",
                        user.id, user.email)
            return Response({"message": "Đổi mật khẩu thành công"},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[CHANGE PASSWORD] Lỗi hệ thống khi đổi mật khẩu user id=%s: %s", id, str(e))
            return Response({"error": f"Lỗi khi đổi mật khẩu: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Xử lý upload hoặc thay avatar
class UploadAvatarView(APIView):
    def put(self, request, id):
        logger.info("[UPLOAD AVATAR] Yêu cầu upload/thay avatar", id)
        try:
            user = get_object_or_404(User, id=id)
            serializer = UploadAvatarSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                logger.info("[UPLOAD AVATAR] Cập nhật avatar thành công cho user id=%s, email=%s",
                            user.id, user.email)
                return Response({'message': 'Cập nhật avatar thành công'},
                                status=status.HTTP_200_OK)
            else:
                logger.warning("[UPLOAD AVATAR] Dữ liệu không hợp lệ khi upload avatar user id=%s: %s",
                               id, serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("[UPLOAD AVATAR] Lỗi hệ thống khi upload avatar user id=%s: %s", id, str(e))
            return Response({"error": f"Lỗi khi upload avatar: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Thiết lập xác thực 2 bước 
class TwoStepSetupView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        logger.info("[2STEP SETUP] POST /api/auth/2step/setup - yêu cầu bật 2FA cho user_id=%s", user_id)

        try:
            user = User.objects.filter(id=user_id).first()
            if not user:
                logger.warning("[2STEP SETUP] Không tìm thấy user id=%s", user_id)
                return Response({'error': 'Không tìm thấy người dùng'}, status=status.HTTP_404_NOT_FOUND)

            # Bật xác thực 2 bước
            user.two_step_auth = True
            user.save()
            logger.info("[2STEP SETUP] Đã bật xác thực 2 bước cho user id=%s, email=%s", user.id, user.email)

            return Response({'message': 'Đã bật xác thực 2 bước'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[2STEP SETUP] Lỗi hệ thống khi bật 2FA cho user id=%s: %s", user_id, str(e))
            return Response({'error': f'Lỗi khi bật xác thực 2 bước: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Gửi mã OTP qua email
class SendOTPView(APIView):  
    def post(self, request):
        logger.info("[SEND OTP] Yêu cầu gửi OTP với dữ liệu: %s", request.data)

        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("[SEND OTP] Dữ liệu không hợp lệ: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        logger.info("[SEND OTP] Email hợp lệ: %s", email)

        try:
            user = User.objects.get(email=email)
            logger.info("[SEND OTP] Tìm thấy người dùng: id=%s, email=%s", user.id, user.email)
        except User.DoesNotExist:
            logger.warning("[SEND OTP] Không tìm thấy người dùng với email: %s", email)
            return Response({"error": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

        otp = str(random.randint(100000, 999999))
        cache.set(f"otp_{email}", otp, timeout=300)
        logger.info("[SEND OTP] Đã tạo OTP: %s cho email: %s", otp, email)

        try:
            send_mail(
                subject="Mã xác thực OTP",
                message=f"Mã OTP của bạn là: {otp}",
                from_email="no-reply@example.com",
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info("[SEND OTP] Đã gửi email OTP tới: %s", email)
        except Exception as e:
            logger.error("[SEND OTP] Lỗi khi gửi email tới %s: %s", email, str(e))
            return Response({"error": "Lỗi khi gửi email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Đã gửi mã OTP tới email"}, status=status.HTTP_200_OK)


# Xác minh 2 bước
class TwoStepVerifyView(APIView):
    def post(self, request):
        logger.info("[2STEP VERIFY] Yêu cầu xác minh OTP với dữ liệu: %s", request.data)

        serializer = TwoStepVerifySerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("[2STEP VERIFY] Dữ liệu không hợp lệ: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_id = serializer.validated_data["user_id"]
        otp_code = serializer.validated_data["otp_code"]
        logger.info("[2STEP VERIFY] Dữ liệu hợp lệ: user_id=%s, otp_code=%s", user_id, otp_code)

        try:
            user = User.objects.get(id=user_id)
            logger.info("[2STEP VERIFY] Tìm thấy người dùng: id=%s, email=%s", user.id, user.email)
        except User.DoesNotExist:
            logger.warning("[2STEP VERIFY] Không tìm thấy người dùng với id=%s", user_id)
            return Response({"error": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

        saved_otp = cache.get(f"otp_user_{user_id}")
        if not saved_otp:
            logger.warning("[2STEP VERIFY] Không tìm thấy mã OTP trong cache cho user_id=%s", user_id)
            return Response({"error": "OTP không hợp lệ hoặc chưa được gửi"}, status=status.HTTP_400_BAD_REQUEST)

        if otp_code != saved_otp:
            logger.warning("[2STEP VERIFY] Mã OTP không khớp: nhập=%s, lưu=%s", otp_code, saved_otp)
            return Response({"error": "Mã OTP không khớp"}, status=status.HTTP_400_BAD_REQUEST)

        cache.delete(f"otp_user_{user_id}")
        logger.info("[2STEP VERIFY] Xác minh OTP thành công cho user_id=%s", user_id)
        return Response({"message": "Xác minh OTP thành công"}, status=status.HTTP_200_OK)


# Xác minh mã OTP
class VerifyOTPView(APIView): 
    def post(self, request):
        logger.info("[VERIFY OTP] Yêu cầu xác minh OTP với dữ liệu: %s", request.data)

        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("[VERIFY OTP] Dữ liệu không hợp lệ: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_id = serializer.validated_data["user_id"]
        otp_code = serializer.validated_data["otp_code"]
        logger.info("[VERIFY OTP] Dữ liệu hợp lệ: user_id=%s, otp_code=%s", user_id, otp_code)

        user = User.objects.filter(id=user_id).first()
        if not user:
            logger.warning("[VERIFY OTP] Không tìm thấy người dùng với id=%s", user_id)
            return Response({"error": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)

        saved_otp = cache.get(f"otp_user_{user.id}")
        if not saved_otp:
            logger.warning("[VERIFY OTP] Không có mã OTP trong cache cho user_id=%s", user_id)
            return Response({"error": "OTP không hợp lệ hoặc đã hết hạn"}, status=status.HTTP_400_BAD_REQUEST)

        if saved_otp != otp_code:
            logger.warning("[VERIFY OTP] Mã OTP không khớp: nhập=%s, lưu=%s", otp_code, saved_otp)
            return Response({"error": "Mã OTP không khớp"}, status=status.HTTP_400_BAD_REQUEST)

        cache.delete(f"otp_user_{user.id}")
        logger.info("[VERIFY OTP] Xác minh OTP thành công cho user_id=%s", user_id)
        return Response({"message": "Xác minh OTP thành công"}, status=status.HTTP_200_OK)


# Yêu cầu đổi mật khẩu qua email
class ResetPasswordRequestView(APIView):
    def post(self, request):
        serializer = ResetPasswordRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'Không tìm thấy người dùng'}, status=status.HTTP_404_NOT_FOUND)

        # Sinh token ngẫu nhiên
        reset_token = str(uuid.uuid4())

        # Lưu token vào cache với thời gian hết hạn 15 phút
        cache.set(f"reset_password_{user.id}", reset_token, timeout=900)

        # Gửi email chứa token
        reset_link = f"https://your-frontend.com/reset-password?token={reset_token}&id={user.id}"
        send_mail(
            subject="Yêu cầu đặt lại mật khẩu",
            message=f"Nhấn vào link sau để đặt lại mật khẩu: {reset_link}\nLink sẽ hết hạn sau 15 phút.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'Email đặt lại mật khẩu đã được gửi'}, status=status.HTTP_200_OK)