// Mocked API layer standing in for a real backend. The goal isn't to fake
// success — it's to behave like a real HTTP client would: realistic
// request/response payloads, network latency, and a mix of failure modes
// so the caller (sync.js) has to handle errors the way it would against a
// real server, not just a single happy path.

const ENDPOINTS = {
  inspection: '/api/inspections',
  incident: '/api/incidents',
};

// Roughly a 1 in 8 chance of a transient failure (dropped connection or the
// server returning a 5xx) and a much rarer 1 in 40 chance of the server
// rejecting the payload outright (a 4xx). These aren't equivalent: a 5xx is
// worth retrying, a 4xx never is.
const TRANSIENT_FAILURE_RATE = 0.125;
const VALIDATION_FAILURE_RATE = 0.025;

export class ApiError extends Error {
  constructor(status, code, message, { retryable }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

function randomLatencyMs() {
  return 300 + Math.floor(Math.random() * 500);
}

function buildRequestBody(entry) {
  return {
    clientRecordId: entry.recordId,
    type: entry.type,
    propertyId: entry.payload.propertyId,
    payload: entry.payload,
    queuedAt: entry.queuedAt,
    submittedAt: new Date().toISOString(),
  };
}

// Simulates POSTing a queued record to the backend. Throws ApiError on
// failure so callers can branch on `.retryable`; resolves with a
// server-shaped response body on success.
export async function postRecord(entry) {
  const endpoint = ENDPOINTS[entry.type];
  await new Promise((resolve) => setTimeout(resolve, randomLatencyMs()));

  const roll = Math.random();

  if (roll < VALIDATION_FAILURE_RATE) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${endpoint} rejected the payload as malformed`, {
      retryable: false,
    });
  }

  if (roll < VALIDATION_FAILURE_RATE + TRANSIENT_FAILURE_RATE) {
    throw new ApiError(503, 'SERVICE_UNAVAILABLE', `${endpoint} is temporarily unavailable`, {
      retryable: true,
    });
  }

  const body = buildRequestBody(entry);
  return {
    status: 201,
    data: {
      serverId: `srv_${entry.recordId}`,
      clientRecordId: body.clientRecordId,
      receivedAt: new Date().toISOString(),
    },
  };
}
