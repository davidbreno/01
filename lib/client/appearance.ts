export type AccentPreset = 'ocean' | 'violet' | 'sunrise';
export type DensityPreset = 'comfortable' | 'compact';
export type MotionPreset = 'full' | 'reduced';

export interface AppearancePreferences {
  accent: AccentPreset;
  density: DensityPreset;
  motion: MotionPreset;
  glass: boolean;
}

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  accent: 'ocean',
  density: 'comfortable',
  motion: 'full',
  glass: true
};

const STORAGE_KEY = 'dr-david-appearance';

type StoredPreferences = AppearancePreferences;

export function applyAppearancePreferences(preferences: AppearancePreferences) {
  if (typeof document === 'undefined') {
    return;
  }
  const body = document.body;
  if (!body) {
    return;
  }
  body.dataset.brand = preferences.accent;
  body.dataset.density = preferences.density;
  body.dataset.motion = preferences.motion;
  body.dataset.glass = preferences.glass ? 'on' : 'off';
}

export function loadAppearancePreferences(): AppearancePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_APPEARANCE;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_APPEARANCE;
    }
    const parsed = JSON.parse(stored) as StoredPreferences;
    return {
      accent: parsed.accent ?? DEFAULT_APPEARANCE.accent,
      density: parsed.density ?? DEFAULT_APPEARANCE.density,
      motion: parsed.motion ?? DEFAULT_APPEARANCE.motion,
      glass: typeof parsed.glass === 'boolean' ? parsed.glass : DEFAULT_APPEARANCE.glass
    };
  } catch (error) {
    console.warn('Não foi possível carregar preferências visuais', error);
    return DEFAULT_APPEARANCE;
  }
}

export function persistAppearancePreferences(preferences: AppearancePreferences) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
