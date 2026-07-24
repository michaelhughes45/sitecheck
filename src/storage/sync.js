import NetInfo from '@react-native-community/netinfo';
import { getSyncQueue, clearSyncQueueEntry, markRecordSynced } from './db';

// In a real app this would POST to your backend. For the demo, we
// simulate a network call with a short delay so the sync flow is
// visible in the UI (badge counts, "Syncing..." state, etc).
async function fakeUploadToServer(entry) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}

export async function drainSyncQueue(onProgress) {
  const queue = await getSyncQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  let synced = 0;
  for (const entry of queue) {
    try {
      const result = await fakeUploadToServer(entry);
      if (result.ok) {
        await markRecordSynced(entry.type, entry.recordId);
        await clearSyncQueueEntry(entry.recordId);
        synced += 1;
        onProgress?.(synced, queue.length);
      }
    } catch (e) {
      // Leave it in the queue; we'll retry on the next connectivity event.
      console.warn('Sync failed for', entry.recordId, e);
    }
  }

  const remaining = (await getSyncQueue()).length;
  return { synced, remaining };
}

// Subscribes to connectivity changes and triggers a drain whenever the
// device transitions from offline to online. Call the returned function
// to unsubscribe (e.g. in a useEffect cleanup).
export function watchConnectivityAndSync(onSyncComplete) {
  let wasOffline = false;

  const unsubscribe = NetInfo.addEventListener((state) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

    if (!isOnline) {
      wasOffline = true;
      return;
    }

    if (isOnline && wasOffline) {
      wasOffline = false;
      drainSyncQueue().then((result) => onSyncComplete?.(result));
    }
  });

  return unsubscribe;
}
