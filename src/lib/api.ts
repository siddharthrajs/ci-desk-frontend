import { API_BASE_URL } from './config';
import type {
  UpstreamResponse,
  MidstreamResponse,
  DownstreamResponse,
  WPSRResponse,
  COTResponse,
  MacroResponse,
} from '../types/api';
import { ApiError } from '../types/api';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, path);
  }
  return res.json() as Promise<T>;
}

export const getUpstreamData = (): Promise<UpstreamResponse> =>
  apiFetch('/api/upstream');

export const getMidstreamData = (): Promise<MidstreamResponse> =>
  apiFetch('/api/midstream');

export const getDownstreamData = (): Promise<DownstreamResponse> =>
  apiFetch('/api/downstream');

export const getWpsrTables = (): Promise<WPSRResponse> =>
  apiFetch('/api/reports/wpsr');

export const getCotPositions = (): Promise<COTResponse> =>
  apiFetch('/api/reports/cot');

export const getMacroData = (): Promise<MacroResponse> =>
  apiFetch('/api/macro');
