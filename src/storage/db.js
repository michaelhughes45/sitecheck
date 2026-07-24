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

// --- Sync queue ----------------------------------------------------------
// Every record created offline gets a queue entry. When connectivity
// returns, sync.js drains this queue and (in a real app) POSTs each
// record to the backend, then removes it from the queue on success.

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

export async function markRecordSynced(type, recordId) {
  const key = type === 'inspection' ? INSPECTIONS_KEY : INCIDENTS_KEY;
  const list = await readList(key);
  const next = list.map((r) => (r.id === recordId ? { ...r, synced: true } : r));
  await writeList(key, next);
}
