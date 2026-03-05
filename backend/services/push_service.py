import json
import os
from pywebpush import webpush, WebPushException
from typing import Any

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIMS = {
    "sub": f"mailto:{os.getenv('ADMIN_EMAIL', 'admin@example.com')}"
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
