import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export type UploadedCatImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  original_filename?: string;
  sub_id?: string;
};

export type CatFavourite = {
  id: number;
  image_id: string;
  sub_id?: string;
};

export type CatVote = {
  id: number;
  image_id: string;
  value: number;
  sub_id?: string;
  created_at?: string;
};

const CAT_API_BASE_URL = 'https://api.thecatapi.com/v1';
const CAT_API_KEY = process.env.EXPO_PUBLIC_CAT_API_KEY?.trim();
export const CAT_SUB_ID = process.env.EXPO_PUBLIC_CAT_SUB_ID?.trim() || 'frontend-challenge-expo';

export function hasCatApiKey() {
  return Boolean(CAT_API_KEY);
}

export function getSetupMessage() {
  return 'The app is not configured right now.';
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function requireApiKey() {
  if (!CAT_API_KEY) {
    throw new Error(getSetupMessage());
  }

  return CAT_API_KEY;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>
) {
  const url = new URL(path, CAT_API_BASE_URL.endsWith('/') ? CAT_API_BASE_URL : `${CAT_API_BASE_URL}/`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseError(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return `Request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(raw) as { message?: string };
    if (parsed.message) {
      return parsed.message;
    }
  } catch {}

  return raw;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { isMultipart?: boolean }
) {
  const headers = new Headers(init?.headers);
  headers.set('x-api-key', requireApiKey());

  if (!options?.isMultipart && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function pagedRequest<T>(
  path: string,
  pageSize: number,
  maxPages: number,
  params?: Record<string, string | number | undefined | null>
) {
  const results: T[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const batch = await request<T[]>(
      `${path}?${new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(params ?? {}).flatMap(([key, value]) =>
            value === undefined || value === null ? [] : [[key, String(value)]]
          )
        ),
        limit: String(pageSize),
        page: String(page),
      }).toString()}`
    );

    results.push(...batch);

    if (batch.length < pageSize) {
      break;
    }
  }

  return results;
}

export async function getUploadedCats() {
  return pagedRequest<UploadedCatImage>('images', 10, 5, {
    order: 'DESC',
    sub_id: CAT_SUB_ID,
  });
}

export async function getFavourites() {
  return pagedRequest<CatFavourite>('favourites', 100, 3, {
    sub_id: CAT_SUB_ID,
  });
}

export async function getVotes() {
  return pagedRequest<CatVote>('votes', 100, 3, {
    sub_id: CAT_SUB_ID,
  });
}

export async function createFavourite(imageId: string) {
  const response = await request<{ id: number }>('favourites', {
    method: 'POST',
    body: JSON.stringify({
      image_id: imageId,
      sub_id: CAT_SUB_ID,
    }),
  });

  return {
    id: response.id,
    image_id: imageId,
    sub_id: CAT_SUB_ID,
  } satisfies CatFavourite;
}

export async function deleteFavourite(favouriteId: number) {
  await request(`favourites/${favouriteId}`, {
    method: 'DELETE',
  });
}

export async function deleteCatImage(imageId: string) {
  await request(`images/${imageId}`, {
    method: 'DELETE',
  });
}

export async function createVote(imageId: string, value: 1 | 0) {
  const response = await request<Partial<CatVote> & { id: number }>('votes', {
    method: 'POST',
    body: JSON.stringify({
      image_id: imageId,
      sub_id: CAT_SUB_ID,
      value,
    }),
  });

  return {
    id: response.id,
    image_id: imageId,
    value: response.value ?? value,
    sub_id: response.sub_id ?? CAT_SUB_ID,
    created_at: response.created_at,
  } satisfies CatVote;
}

export async function uploadCatImage(asset: ImagePickerAsset) {
  if (!asset.uri) {
    throw new Error('Please choose an image first.');
  }

  const formData = new FormData();

  if (Platform.OS === 'web' && asset.file) {
    formData.append('file', asset.file, asset.fileName ?? 'cat-upload.jpg');
  } else {
    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName ?? `cat-upload-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    } as never);
  }

  formData.append('sub_id', CAT_SUB_ID);

  return request<UploadedCatImage>(
    'images/upload',
    {
      method: 'POST',
      body: formData,
    },
    { isMultipart: true }
  );
}
