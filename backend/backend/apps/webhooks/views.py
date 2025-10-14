# from django.shortcuts import render
# from rest_framework import viewsets
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime
from .models import Webhook
from .serializers import WebhookSerializer
import requests

# Create your views here.
# class WebhookViewSet(viewsets.ModelViewSet):
#     queryset = Webhook.objects.all()
#     serializer_class = WebhookSerializer

logger = logging.getLogger(__name__)

# Đăng ký webhook mới 
class WebhookCreateView(APIView):
    def post(self, request):
        logger.info("[WEBHOOK CREATE] Bắt đầu đăng ký webhook mới")
        try:
            serializer = WebhookSerializer(data=request.data)
            if serializer.is_valid():
                webhook = serializer.save(created_day=datetime.now())
                logger.info("[WEBHOOK CREATE] Webhook(id=%s, url='%s') đã được đăng ký thành công",
                            webhook.id, getattr(webhook, "url", ""))
                return Response(
                    {
                        "message": f"Webhook id={webhook.id} đã được đăng ký thành công",
                        **serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )

            logger.warning("[WEBHOOK CREATE] Dữ liệu không hợp lệ: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("[WEBHOOK CREATE] Lỗi khi đăng ký webhook: %s", str(e))
            return Response({"error": f"Lỗi khi đăng ký webhook: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Lấy, cập nhật, xóa webhook 
class WebhookDetailView(APIView):
    # Lấy thông tin webhook
    def get(self, request, id):
        logger.info("[WEBHOOK DETAIL] Yêu cầu lấy thông tin webhook id=%s", id)
        try:
            webhook = get_object_or_404(Webhook, id=id)
            serializer = WebhookSerializer(webhook, context={"request": request})
            logger.info("[WEBHOOK DETAIL] Webhook(id=%s, url='%s') lấy thành công",
                        webhook.id, getattr(webhook, "url", ""))
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("[WEBHOOK DETAIL] Lỗi khi lấy webhook id=%s: %s", id, str(e))
            return Response({"error": f"Lỗi khi lấy webhook: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Cập nhật webhook
    def put(self, request, id):
        logger.info("[WEBHOOK UPDATE] Yêu cầu cập nhật webhook id=%s", id)
        try:
            webhook = get_object_or_404(Webhook, id=id)
            serializer = WebhookSerializer(webhook, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save(updated_day=datetime.now())
                logger.info("[WEBHOOK UPDATE] Webhook(id=%s, url='%s') đã cập nhật thành công",
                            updated.id, getattr(updated, "url", ""))
                return Response(
                    {"message": "Webhook đã được cập nhật thành công", **serializer.data},
                    status=status.HTTP_200_OK
                )
            logger.warning("[WEBHOOK UPDATE] Dữ liệu không hợp lệ: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("[WEBHOOK UPDATE] Lỗi khi cập nhật webhook id=%s: %s", id, str(e))
            return Response({"error": f"Lỗi khi cập nhật webhook: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Xóa webhook
    def delete(self, request, id):
        logger.info("[WEBHOOK DELETE] Yêu cầu xóa webhook id=%s", id)
        try:
            webhook = get_object_or_404(Webhook, id=id)
            webhook_url = getattr(webhook, "url", "")
            webhook.delete()
            logger.info("[WEBHOOK DELETE] Webhook(id=%s, url='%s') đã được xóa thành công",
                        id, webhook_url)
            return Response({"message": f"Webhook '{webhook_url}' đã được xóa thành công"},
                            status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.exception("[WEBHOOK DELETE] Lỗi khi xóa webhook id=%s: %s", id, str(e))
            return Response({"error": f"Lỗi khi xóa webhook: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Gửi dữ liệu sự kiện đến endpoint đã đăng
class EventSendView(APIView):
    # def post(self, request):
    #     event_data = request.data
    #     # Lấy tất cả webhook đang active
    #     # webhooks = Webhook.objects.filter(active=True)
    #     webhooks = Webhook.objects.all()
    #     results = []
    #     for webhook in webhooks:
    #         try:
    #             resp = requests.post(webhook.endpoint_url, json=event_data, timeout=5)
    #             results.append({
    #                 'webhook_id': webhook.id,
    #                 'status_code': resp.status_code,
    #                 'response': resp.text
    #             })
    #         except Exception as e:
    #             results.append({
    #                 'webhook_id': webhook.id,
    #                 'error': str(e)
    #             })
    #     return Response({'results': results}, status=status.HTTP_200_OK)

    def post(self, request):
        event_data = request.data
        logger.info("[EVENT SEND] Nhận yêu cầu gửi sự kiện: %s", event_data)

        results = []
        try:
            # Lấy tất cả webhook đang active
            webhooks = Webhook.objects.filter(active=True)
            logger.info("[EVENT SEND] Tìm thấy %s webhook đang active", webhooks.count())

            for webhook in webhooks:
                try:
                    r = requests.post(webhook.endpoint_url, json=event_data, timeout=5)
                    results.append({
                        "webhook_id": webhook.id,
                        "url": webhook.endpoint_url,
                        "status_code": r.status_code
                    })
                    logger.info("[EVENT SEND] Gửi sự kiện tới webhook id=%s (%s) thành công, status=%s",
                                webhook.id, webhook.endpoint_url, r.status_code)
                except Exception as e:
                    results.append({
                        "webhook_id": webhook.id,
                        "url": webhook.endpoint_url,
                        "error": str(e)
                    })
                    logger.error("[EVENT SEND] Lỗi khi gửi sự kiện tới webhook id=%s (%s): %s",
                                 webhook.id, webhook.endpoint_url, str(e))

            return Response({"results": results}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[EVENT SEND] Lỗi hệ thống khi gửi sự kiện: %s", str(e))
            return Response({"error": f"Lỗi khi gửi sự kiện: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
