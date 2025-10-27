const DEMO_STORAGE_KEY = 'mos_demo_state_v1';

const DEMO_USERS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'resident.demo@mos',
    password: 'demo123',
    displayName: 'Maria Demo',
    userType: 'RESIDENT',
    permissions: ['VIEW_REMINDERS', 'CREATE_REMINDERS', 'MEAL_REQUIREMENTS', 'MEAL_SUGGESTIONS'],
  },
];

const DEFAULT_REMINDERS = [
  {
    id: 'aaaa1111-2222-3333-4444-555555555555',
    type: 'once',
    category: 'MEAL',
    note: '*Lunch med Anna*Glöm inte extra grönsaker',
    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // two hours ahead
    days: [],
    times: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bbbb1111-2222-3333-4444-555555555555',
    type: 'recurring',
    category: 'MEDICATION',
    note: 'Blodtryckstablett efter frukost',
    dateTime: null,
    days: ['Mån', 'Ons', 'Fre'],
    times: ['08:00'],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_REQUIREMENTS = [
  {
    id: 'cccc1111-2222-3333-4444-555555555555',
    requirement: 'Vegetarisk',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dddd1111-2222-3333-4444-555555555555',
    requirement: 'Laktosfri',
    createdAt: new Date().toISOString(),
  },
];

const jsonHeaders = { 'Content-Type': 'application/json' };

function loadState() {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      return {
        remindersByUser: {
          [DEMO_USERS[0].id]: DEFAULT_REMINDERS,
        },
        mealRequirementsByUser: {
          [DEMO_USERS[0].id]: DEFAULT_REQUIREMENTS,
        },
      };
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Demo mode: could not load stored state, falling back to defaults.', error);
    return {
      remindersByUser: {
        [DEMO_USERS[0].id]: DEFAULT_REMINDERS,
      },
      mealRequirementsByUser: {
        [DEMO_USERS[0].id]: DEFAULT_REQUIREMENTS,
      },
    };
  }
}

function persistState(state) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Demo mode: could not persist state.', error);
  }
}

function buildResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {}),
    },
  });
}

function unauthorized() {
  return buildResponse({ error: 'Unauthorized' }, { status: 401 });
}

function notFound(path) {
  return buildResponse({ error: 'Not Found', path }, { status: 404 });
}

async function parseJsonBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }
  if (body instanceof Blob || body instanceof ArrayBuffer) {
    const text = await body.text?.() ?? '';
    try {
      return JSON.parse(text);
    } catch (error) {
      return {};
    }
  }
  try {
    const text = await new Response(body).text();
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

function getAuthorizationHeader(input, init) {
  if (init?.headers) {
    const headers = init.headers;
    if (headers.get) {
      return headers.get('Authorization') || headers.get('authorization');
    }
    return headers.Authorization || headers.authorization || headers['Authorization'] || headers['authorization'] || null;
  }
  if (input instanceof Request) {
    return input.headers.get('Authorization') || input.headers.get('authorization');
  }
  return null;
}

function userIdFromToken(token) {
  if (!token || !token.startsWith('demo-token-')) {
    return null;
  }
  const userId = token.replace('demo-token-', '');
  return DEMO_USERS.find((user) => user.id === userId) ? userId : null;
}

function getDemoUserByEmail(email) {
  return DEMO_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function ensureDemoState(state, key, userId, fallback) {
  if (!state[key][userId]) {
    state[key][userId] = fallback(userId);
  }
}

function generateUuid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function enableDemoMode() {
  if (typeof window === 'undefined') return;
  if (window.__mosDemoModeEnabled) return;

  window.__mosDemoModeEnabled = true;

  let state = loadState();
  const baseUrl = window.location.origin;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input.url;
    const url = new URL(requestUrl, baseUrl);
    const path = url.pathname;
    const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    if (!path.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(init.body);
      const user = body?.email ? getDemoUserByEmail(body.email) : null;
      if (!user || body.password !== user.password) {
        return buildResponse({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = `demo-token-${user.id}`;
      return buildResponse({
        token,
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
      });
    }

    if (path === '/api/auth/me' && method === 'GET') {
      const authHeader = getAuthorizationHeader(input, init);
      if (!authHeader?.startsWith('Bearer ')) {
        return unauthorized();
      }
      const userId = userIdFromToken(authHeader.slice(7));
      if (!userId) {
        return unauthorized();
      }
      const user = DEMO_USERS.find((u) => u.id === userId);
      return buildResponse({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
      });
    }

    if (path === '/api/user-management/permissions' && method === 'GET') {
      const authHeader = getAuthorizationHeader(input, init);
      if (!authHeader?.startsWith('Bearer ')) {
        return unauthorized();
      }
      const userId = userIdFromToken(authHeader.slice(7));
      if (!userId) {
        return unauthorized();
      }
      const user = DEMO_USERS.find((u) => u.id === userId);
      return buildResponse(user.permissions);
    }

    const reminderMatch = path.match(/^\/api\/users\/([^/]+)\/reminders(?:\/([^/]+))?$/);
    if (reminderMatch) {
      const authHeader = getAuthorizationHeader(input, init);
      if (!authHeader?.startsWith('Bearer ')) {
        return unauthorized();
      }
      const requesterId = userIdFromToken(authHeader.slice(7));
      if (!requesterId) {
        return unauthorized();
      }

      const [, userId, reminderId] = reminderMatch;
      ensureDemoState(state, 'remindersByUser', userId, () => []);

      if (method === 'GET' && !reminderId) {
        const reminders = state.remindersByUser[userId] ?? [];
        return buildResponse(reminders);
      }

      if (method === 'POST' && !reminderId) {
        const body = await parseJsonBody(init.body);
        const reminder = {
          id: generateUuid(),
          type: body.type || 'once',
          category: body.category || 'OTHER',
          note: body.note || null,
          dateTime: body.type === 'recurring' ? null : body.dateTime || new Date().toISOString(),
          days: Array.isArray(body.days) ? body.days : [],
          times: Array.isArray(body.times) ? body.times : [],
          createdAt: new Date().toISOString(),
        };
        state.remindersByUser[userId] = [
          reminder,
          ...(state.remindersByUser[userId] ?? []),
        ];
        persistState(state);
        return buildResponse(reminder, { status: 201 });
      }

      if (method === 'PUT' && reminderId) {
        const body = await parseJsonBody(init.body);
        const reminders = state.remindersByUser[userId] ?? [];
        const index = reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) {
          return notFound(path);
        }
        const existing = reminders[index];
        const updated = {
          ...existing,
          type: body.type ?? existing.type,
          category: body.category ?? existing.category,
          note: body.note ?? existing.note,
          dateTime: (body.type ?? existing.type) === 'recurring'
            ? null
            : body.dateTime ?? existing.dateTime,
          days: Array.isArray(body.days) ? body.days : existing.days,
          times: Array.isArray(body.times) ? body.times : existing.times,
        };
        reminders[index] = updated;
        state.remindersByUser[userId] = reminders;
        persistState(state);
        return buildResponse(updated);
      }

      if (method === 'DELETE' && reminderId) {
        const reminders = state.remindersByUser[userId] ?? [];
        const filtered = reminders.filter((r) => r.id !== reminderId);
        state.remindersByUser[userId] = filtered;
        persistState(state);
        return new Response(null, { status: 204 });
      }
    }

    const mealMatch = path.match(/^\/api\/users\/([^/]+)\/meal-requirements$/);
    if (mealMatch) {
      const authHeader = getAuthorizationHeader(input, init);
      if (!authHeader?.startsWith('Bearer ')) {
        return unauthorized();
      }
      const requesterId = userIdFromToken(authHeader.slice(7));
      if (!requesterId) {
        return unauthorized();
      }

      const [, userId] = mealMatch;
      ensureDemoState(state, 'mealRequirementsByUser', userId, () => []);

      if (method === 'GET') {
        return buildResponse({
          requirements: state.mealRequirementsByUser[userId] ?? [],
        });
      }

      if (method === 'POST') {
        const body = await parseJsonBody(init.body);
        const items = Array.isArray(body?.requirements) ? body.requirements : [];
        const now = new Date().toISOString();
        const mapped = items.map((entry) => ({
          id: generateUuid(),
          requirement: entry,
          createdAt: now,
        }));
        state.mealRequirementsByUser[userId] = mapped;
        persistState(state);
        return buildResponse({ requirements: mapped }, { status: 201 });
      }
    }

    return notFound(path);
  };
}
