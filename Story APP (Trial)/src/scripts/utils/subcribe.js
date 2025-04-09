import CONFIG from "../config";
import { convertBase64ToUint8Array, notification } from ".";
import { subscribePushNotification, unsubscribePushNotification } from "../data/api";
const VAPID_PUBLIC_KEY = CONFIG.PUBLIC_VAPID_KEY;

export async function subscribeUser(swRegistration) {
    try {
      const convertedVapidKey = convertBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
  
      const data = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
        },
      };
  
      const result = await subscribePushNotification(data);
      if (!result.ok) notification('failed', result.message);
      if (result.ok) notification('success', result.message);
      return true;
    } catch (err) {
      notification('failed', err.message);
      return false;
    }
}
  
export async function unsubscribeUser(swRegistration) {
    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      if (!subscription) return true;
  
      const result = await unsubscribePushNotification({ endpoint: subscription.endpoint });
      await subscription.unsubscribe();
  
      if (!result.ok) notification('failed', result.message);
      if (result.ok) notification('success', result.message);
  
      return true;
    } catch (err) {
      notification('failed', err.message);
      return false;
    }
}

