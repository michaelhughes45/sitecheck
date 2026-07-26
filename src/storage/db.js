import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const INSPECTIONS_KEY = 'sitecheck:inspections';
const INCIDENTS_KEY = 'sitecheck:incidents';
const SYNC_QUEUE_KEY = 'sitecheck:sync_queue';

async function readList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn(`Failed to read ${key}`, e);
    return [];
  }
}

async function writeList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

// --- Inspections -----------------------------------------------------

export async function saveInspection(record) {
  const list = await readList(INSPECTIONS_KEY);
  list.unshift(record);
  await writeList(INSPECTIONS_KEY, list);
  await enqueueForSync({ type: 'inspection', recordId: record.id });
  return record;
}

export async function getInspections(propertyId) {
  const list = await readList(INSPECTIONS_KEY);
  return propertyId ? list.filter((r) => r.propertyId === propertyId) : list;
}

// --- Incidents ---------------------------------------------------------

export async function saveIncident(record) {
  const list = await readList(INCIDENTS_KEY);
  list.unshift(record);
  await writeList(INCIDENTS_KEY, list);
  await enqueueForSync({ type: 'incident', recordId: record.id });
  return record;
}

export async function getIncidents(propertyId) {
  const list = await readList(INCIDENTS_KEY);
  return propertyId ? list.filter((r) => r.propertyId === propertyId) : list;
}

function keyForType(type) {
  return type === 'inspection' ? INSPECTIONS_KEY : INCIDENTS_KEY;
}

export async function getRecordById(type, recordId) {
  const list = await readList(keyForType(type));
  return list.find((r) => r.id === recordId) || null;
}

// --- Sync queue ----------------------------------------------------------
// Every record created offline gets a queue entry. When connectivity
// returns, sync.js drains this queue and POSTs each record to the mocked
// API layer (src/api/client.js), then removes it from the queue on success.

export async function enqueueForSync(entry) {
  const queue = await readList(SYNC_QUEUE_KEY);
  queue.push({ ...entry, queuedAt: new Date().toISOString(), attempts: 0 });
  await writeList(SYNC_QUEUE_KEY, queue);
}

export async function getSyncQueue() {
  return readList(SYNC_QUEUE_KEY);
}

export async function clearSyncQueueEntry(recordId) {
  const queue = await readList(SYNC_QUEUE_KEY);
  const next = queue.filter((q) => q.recordId !== recordId);
  await writeList(SYNC_QUEUE_KEY, next);
}

// Bumps the retry count on a queue entry after a retryable failure, so
// repeated transient errors are visible (and could later drive backoff).
export async function incrementSyncAttempt(recordId) {
  const queue = await readList(SYNC_QUEUE_KEY);
  const next = queue.map((q) =>
    q.recordId === recordId ? { ...q, attempts: q.attempts + 1 } : q
  );
  await writeList(SYNC_QUEUE_KEY, next);
}

export async function markRecordSynced(type, recordId) {
  const list = await readList(keyForType(type));
  const next = list.map((r) => (r.id === recordId ? { ...r, synced: true, syncError: null } : r));
  await writeList(keyForType(type), next);
}

// Used when the server permanently rejects a record (e.g. validation
// failure) — it's removed from the retry queue but stays flagged on the
// record itself instead of silently disappearing.
export async function markRecordSyncFailed(type, recordId, message) {
  const list = await readList(keyForType(type));
  const next = list.map((r) => (r.id === recordId ? { ...r, syncError: message } : r));
  await writeList(keyForType(type), next);
}
