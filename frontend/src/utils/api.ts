const normalizeBaseUrl = (url?: string): string => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API_BASE = normalizeBaseUrl(process.env.REACT_APP_API_URL);

/**
 * Build full API URL supporting relative paths in production.
 * Defaults to same-origin `/api/...` when `REACT_APP_API_URL` is not set.
 */
export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};




