import NetInfo from '@react-native-community/netinfo';
import { postRecord, ApiError } from '../api/client';
import {
  getSyncQueue,
  getRecordById,
  clearSyncQueueEntry,
  markRecordSynced,
  markRecordSyncFailed,
  incrementSyncAttempt,
} from './db';

export async function drainSyncQueue(onProgress) {
  const queue = await getSyncQueue();
  if (queue.length === 0) return { synced: 0, failed: 0, remaining: 0 };

  let synced = 0;
  let failed = 0;

  for (const entry of queue) {
    const record = await getRecordById(entry.type, entry.recordId);
    if (!record) {
      // Record was deleted locally after being queued; nothing to sync.
      await clearSyncQueueEntry(entry.recordId);
      continue;
    }

    try {
      await postRecord({ ...entry, payload: record });
      await markRecordSynced(entry.type, entry.recordId);
      await clearSyncQueueEntry(entry.recordId);
      synced += 1;
      onProgress?.(synced, queue.length);
    } catch (e) {
      if (e instanceof ApiError && !e.retryable) {
        // The server rejected the payload outright — retrying won't help,
        // so stop queuing it but surface the failure on the record.
        await markRecordSyncFailed(entry.type, entry.recordId, e.message);
        await clearSyncQueueEntry(entry.recordId);
        failed += 1;
      } else {
        // Transient failure (network drop, 5xx) — leave it queued and
        // retry on the next connectivity event.
        await incrementSyncAttempt(entry.recordId);
        console.warn('Sync failed for', entry.recordId, e.message || e);
      }
    }
  }

  const remaining = (await getSyncQueue()).length;
  return { synced, failed, remaining };
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
