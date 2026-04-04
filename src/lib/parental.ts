const PARENTAL_KEY = "chouf_parental_settings";
const LOCKED_CHANNELS_KEY = "chouf_locked_channels";

export interface ParentalSettings {
  enabled: boolean;
  pin: string;
  hiddenCategories: string[];
  customCategories: string[];
  lockedChannelIds: string[];
}

const DEFAULT_ADULT_CATS = ["Adult", "XXX", "+18", "Pour adultes", "Adults", "adult", "xxx", "ADULT", "Adulte"];

export function getParentalSettings(): ParentalSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(PARENTAL_KEY) || "{}");
    return {
      enabled: stored.parentalEnabled || stored.enabled || false,
      pin: stored.parentalPin || stored.pin || "",
      hiddenCategories: stored.hiddenCategories || [...DEFAULT_ADULT_CATS],
      customCategories: stored.customCategories || [],
      lockedChannelIds: stored.lockedChannelIds || [],
    };
  } catch {
    return { enabled: false, pin: "", hiddenCategories: [...DEFAULT_ADULT_CATS], customCategories: [], lockedChannelIds: [] };
  }
}

export function saveParentalSettings(settings: ParentalSettings) {
  localStorage.setItem(PARENTAL_KEY, JSON.stringify(settings));
}

export function isChannelLocked(channelId: string): boolean {
  const s = getParentalSettings();
  if (!s.enabled) return false;
  return s.lockedChannelIds.includes(channelId);
}

export function isCategoryHidden(category: string): boolean {
  const s = getParentalSettings();
  if (!s.enabled) return false;
  const allCats = [...s.hiddenCategories, ...s.customCategories];
  return allCats.some(c => category.toLowerCase().includes(c.toLowerCase()));
}

export function verifyPin(pin: string): boolean {
  const s = getParentalSettings();
  return s.pin === pin;
}

export function toggleLockedChannel(channelId: string): ParentalSettings {
  const s = getParentalSettings();
  const idx = s.lockedChannelIds.indexOf(channelId);
  if (idx >= 0) s.lockedChannelIds.splice(idx, 1);
  else s.lockedChannelIds.push(channelId);
  saveParentalSettings(s);
  return s;
}
