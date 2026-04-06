/**
 * TV Navigation Engine
 * Manages focus zones (columns) and items within each zone for D-PAD navigation.
 */

export interface TvZone {
  id: string;
  items: string[]; // array of focusable item IDs
}

export interface TvNavState {
  zoneIndex: number;
  itemIndex: number;
}

export function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

/**
 * Navigate within zones and items.
 * Returns the new state after applying a direction.
 */
export function navigate(
  state: TvNavState,
  direction: "up" | "down" | "left" | "right",
  zones: TvZone[]
): TvNavState {
  if (zones.length === 0) return state;

  const { zoneIndex, itemIndex } = state;
  const zone = zones[clampIndex(zoneIndex, zones.length)];

  switch (direction) {
    case "up":
      return { zoneIndex, itemIndex: clampIndex(itemIndex - 1, zone.items.length) };
    case "down":
      return { zoneIndex, itemIndex: clampIndex(itemIndex + 1, zone.items.length) };
    case "left": {
      const newZone = clampIndex(zoneIndex - 1, zones.length);
      const targetZone = zones[newZone];
      return { zoneIndex: newZone, itemIndex: clampIndex(itemIndex, targetZone.items.length) };
    }
    case "right": {
      const newZone = clampIndex(zoneIndex + 1, zones.length);
      const targetZone = zones[newZone];
      return { zoneIndex: newZone, itemIndex: clampIndex(itemIndex, targetZone.items.length) };
    }
    default:
      return state;
  }
}

/**
 * Get the currently focused item ID from state + zones.
 */
export function getFocusedItemId(state: TvNavState, zones: TvZone[]): string | null {
  if (zones.length === 0) return null;
  const zone = zones[clampIndex(state.zoneIndex, zones.length)];
  if (!zone || zone.items.length === 0) return null;
  return zone.items[clampIndex(state.itemIndex, zone.items.length)] || null;
}

/**
 * Get the currently focused zone ID.
 */
export function getFocusedZoneId(state: TvNavState, zones: TvZone[]): string | null {
  if (zones.length === 0) return null;
  return zones[clampIndex(state.zoneIndex, zones.length)]?.id || null;
}
