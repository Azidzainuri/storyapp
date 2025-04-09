import { convertBase64ToUint8Array, notification } from ".";
import CONFIG from "../config";
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
    return 'Notification' in window;
}
   
export function isNotificationGranted() {
    return Notification.permission === 'granted';
}
   
export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
      console.error('Notification API unsupported.');
      return false;
    }
   
    if (isNotificationGranted()) {
      return true;
    }
   
    const status = await Notification.requestPermission();
   
    if (status === 'denied') {
      notification('failed', 'Izin notifikasi ditolak.');
      return false;
    }
   
    if (status === 'default') {
      notification('failed', 'Izin notifikasi ditutup atau diabaikan.');
      return false;
    }
   
    return true;
}
   
export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    return await registration.pushManager.getSubscription();
}
   
export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.PUBLIC_VAPID_KEY),
  };
}

export async function subscribe() {
    if (!(await requestNotificationPermission())) {
      return;
    }
   
    if (await isCurrentPushSubscriptionAvailable()) {
      notification('success', 'Sudah berlangganan push notification.');
      return;
    }
   
    console.log('Mulai berlangganan push notification...');
    const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
    const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';
    let pushSubscription;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
      const { endpoint, keys } = pushSubscription.toJSON();
      console.log({ endpoint, keys });
      const response = await subscribePushNotification({ endpoint, keys });
      if (!response.ok) {
        console.error('subscribe: response:', response);
        notification('failed', failureSubscribeMessage);
        // Undo subscribe to push notification
        await pushSubscription.unsubscribe();
        return;
      }
      notification('success', successSubscribeMessage);
    } catch (error) {
      console.error('subscribe: error:', error);
      notification('failed', failureSubscribeMessage);
      await pushSubscription.unsubscribe();
    }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      notification('failed', 'Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      notification('failed', failureUnsubscribeMessage);
      console.error('unsubscribe: response:', response);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      notification('failed', failureUnsubscribeMessage);
      await subscribePushNotification({ endpoint, keys });
      return;
    }
    notification('success', successUnsubscribeMessage);
  } catch (error) {
    notification('failed', failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
  }
}