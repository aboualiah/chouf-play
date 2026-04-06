export type TvSection = "categories" | "channels" | "preview";

export interface TvFocusState {
  section: TvSection;
  indices: Record<TvSection, number>;
}

export interface TvCounts {
  categories: number;
  channels: number;
  preview: number;
}

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

export function createInitialTvFocus(): TvFocusState {
  return {
    section: "categories",
    indices: {
      categories: 0,
      channels: 0,
      preview: 0,
    },
  };
}

export function moveVertical(
  state: TvFocusState,
  direction: "up" | "down",
  counts: TvCounts
): TvFocusState {
  const section = state.section;
  const currentIndex = state.indices[section];
  const maxIndex = Math.max(0, counts[section] - 1);
  const nextIndex =
    direction === "up"
      ? clamp(currentIndex - 1, 0, maxIndex)
      : clamp(currentIndex + 1, 0, maxIndex);

  return {
    ...state,
    indices: {
      ...state.indices,
      [section]: nextIndex,
    },
  };
}

export function moveHorizontal(
  state: TvFocusState,
  direction: "left" | "right",
  counts: TvCounts
): TvFocusState {
  const order: TvSection[] = ["categories", "channels", "preview"];
  const currentPos = order.indexOf(state.section);
  const nextPos =
    direction === "left"
      ? clamp(currentPos - 1, 0, order.length - 1)
      : clamp(currentPos + 1, 0, order.length - 1);

  let nextSection = order[nextPos];

  if (counts[nextSection] === 0) {
    const fallbackSections =
      direction === "right"
        ? order.slice(nextPos + 1)
        : [...order.slice(0, nextPos)].reverse();
    const found = fallbackSections.find((s) => counts[s] > 0);
    nextSection = found ?? state.section;
  }

  return {
    ...state,
    section: nextSection,
    indices: {
      ...state.indices,
      [nextSection]: clamp(
        state.indices[nextSection],
        0,
        Math.max(0, counts[nextSection] - 1)
      ),
    },
  };
}
