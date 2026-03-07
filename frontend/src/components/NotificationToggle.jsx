import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiBell, FiBellOff } from 'react-icons/fi';

const VAPID_PUBLIC_KEY = 'BJ4h_A-D7S0_XQ6X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8'; // Placeholder, should be from env

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function NotificationToggle() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Fetch VAPID key
            const res = await authAPI.getVapidKey();
            const { publicKey } = res.data;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            await authAPI.subscribePush(subscription);
            setIsSubscribed(true);
            toast.success('Notifications enabled!');
        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error('Failed to enable notifications');
        } finally {
            setLoading(false);
        }
    };

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return null;
    }

    return (
        <button
            className={`btn-notification-toggle ${isSubscribed ? 'active' : ''}`}
            onClick={isSubscribed ? null : subscribeUser}
            disabled={loading || isSubscribed}
            title={isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
        >
            {isSubscribed ? <FiBell /> : <FiBellOff />}
            <span>{isSubscribed ? 'Notifications On' : 'Enable Notifications'}</span>
        </button>
    );
}
