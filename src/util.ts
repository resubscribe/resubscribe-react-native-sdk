import Color from 'color';

export const baseUrl = 'https://app.resubscribe.ai';
export const apiUrl = 'https://api.resubscribe.ai';
export const domain = 'app.resubscribe.ai';

export const api = {
  get: async (path: string, params: Record<string, string | null | undefined>, apiKey : string | undefined) => {
    const query = Object.entries(params).filter(([_, value]) => value).map(([key, value]) => `${key}=${value}`).join('&');
    const url = `${apiUrl}/v1/${path}?${query}`;
    const response = await fetch(
      url,
      {
        // TODO: Should probably still not be cached, but no-cache causes server reject
        // cache: 'no-cache', // This adds an unexpected underscore query param which the server rejects
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(apiKey ? {'Authorization': 'Bearer ' + apiKey} : {}),
        }
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response.json();
  },
}

export type AIType = 'intent' | 'churn' | 'delete' | 'subscriber' | 'presubscription' | 'precancel';

export type CloseFn = (via: 'cancel-consent' | 'close') => void;

export type State = 'closed' | 'confirming' | 'open';

// TODO: move to server
/**
 * Get default titles for each AI type.
 */
export const getTitle = (aiType: AIType) => {
  switch (aiType) {
    case 'intent':
      return 'Not ready to pay?';
    case 'churn':
      return 'We\'re sorry to see you go';
    case 'delete':
      return 'We\'re sorry to see you go';
    case 'subscriber':
      return 'Would you like to tell us about your experience?';
    case 'presubscription':
      return 'Can we ask you a few questions?';
    case 'precancel':
      return 'Can we ask you a few questions?';
  }
};

// TODO: move to server
/**
 * Get default descriptions for each AI type.
 */
export const getDescription = (aiType: AIType) => {
  switch (aiType) {
    case 'intent':
      return 'Can we ask you a few questions? It should only take a few minutes.';
    case 'churn':
      return 'Can we ask you a few questions? It should only take a few minutes.';
    case 'delete':
      return 'Can we ask you a few questions? It should only take a few minutes.';
    case 'subscriber':
      return 'Can we ask you a few questions? It should only take a few minutes.';
    case 'presubscription':
      return 'We\'d love to hear your thoughts. It should only take a few minutes.';
    case 'precancel':
      return 'We\'d love to hear your thoughts. It should only take a few minutes.';
  }
}

export const getNavigatorLanguage = (): string | null => {
  if (navigator.languages && navigator.languages.length) {
    return navigator.languages[0];
  } else {
    return (navigator as any).userLanguage || navigator.language || (navigator as any).browserLanguage || null;
  }
};

export const reduceOpacity = (color: string, opacity: number) => {
  return Color(color).alpha(opacity).string();
}

export const isDarkColor = (color: string) => {
  return Color(color).isDark();
};

export const cx = (...classes: Array<string | null | undefined>) => classes.filter(Boolean).join(' ');