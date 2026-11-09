export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions {
  token?: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'
).replace(/\/+$/, '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function messageFromPayload(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const message = payload.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === 'string',
    );
    if (messages.length > 0) return messages.join('. ');
  }
  return undefined;
}

async function errorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (text) {
    try {
      const payload: unknown = JSON.parse(text);
      const message = messageFromPayload(payload);
      if (message) return message;
    } catch {
      return text.slice(0, 300);
    }
  }
  return `A solicitação falhou (${response.status}).`;
}

function headersFor(options: ApiRequestOptions): Headers {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  return headers;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: headersFor(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

export async function apiRequestVoid(
  path: string,
  options: ApiRequestOptions = {},
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: headersFor(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status);
  }
}
