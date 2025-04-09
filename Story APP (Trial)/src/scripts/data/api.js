import CONFIG from '../config';
import { getAccessToken } from '../utils/auth';
import Database from './database';

const BASE_URL = CONFIG.BASE_URL;

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  // Stories
  STORY_LIST : `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORY_ADD: `${BASE_URL}/stories`,

  // Subcribe
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories(page = 1, size = 10) {
  if (navigator.onLine) {
    const accessToken = getAccessToken();
    try {
      const fetchResponse = await fetch(`${ENDPOINTS.STORY_LIST}?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await fetchResponse.json();
      if (json && json.listStory) {
        for (const story of json.listStory) {
          await Database.putcacheStories(story);
        }
      }
      return {
        ...json,
        ok: fetchResponse.ok,
      };
    } catch (err) {
      console.error('Fetch error, loading from cache', err);
      const cached = await Database.getAllcacheStories();
      return {
        listStory: cached.slice((page - 1) * size, page * size),
        ok: false,
        message: 'Offline mode: data diambil dari cache',
      };
    }
  } else {
    const cached = await Database.getAllcacheStories();
    return {
      listStory: cached.slice((page - 1) * size, page * size),
      ok: false,
      message: 'Offline mode: data diambil dari cache',
    };
  }
}

export async function getStoriesDetail(id) {
  if (navigator.onLine) {
    const accessToken = getAccessToken();

    try {
      const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await fetchResponse.json();

      if (json && json.story) {
        await Database.putcacheStories(json.story); // simpan ke IndexedDB
      }

      return {
        ...json,
        ok: fetchResponse.ok,
      };
    } catch (err) {
      console.error('Fetch error, loading detail from cache', err);
      const cached = await Database.getcacheStoriesDetail(id);
      return {
        story: cached,
        ok: false,
        message: 'Offline mode: data diambil dari cache',
      };
    }
  } else {
    const cached = await Database.getcacheStoriesDetail(id);
    return {
      story: cached,
      ok: false,
      message: 'Offline mode: data diambil dari cache',
    };
  }
}

export async function storiesAdd({
  description,
  photo,
  lat,
  lon
}) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.set('description', description);
  formData.set('photo', photo);
  formData.set('lat', lat);
  formData.set('lon', lon);

  const fetchResponse = await fetch(ENDPOINTS.STORY_ADD, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
  });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}