import json
from pywebpush import webpush, WebPushException
from typing import Any
from config.settings import settings

VAPID_PRIVATE_KEY = settings.vapid_private_key
VAPID_PUBLIC_KEY = settings.vapid_public_key
VAPID_CLAIMS = {
    "sub": f"mailto:{settings.admin_email}"
}

class PushService:
    @staticmethod
    def send_push(subscription_info: dict, data: Any):
        """Send a push notification to a specific subscription."""
        if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
            print("VAPID keys not set. Skipping push notification.")
            return

        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(data),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        except WebPushException as ex:
            print(f"WebPush error: {ex}")
            # If the subscription is no longer valid, we should ideally remove it
            if ex.response and ex.response.status_code == 410:
                print("Subscription expired or gone.")
