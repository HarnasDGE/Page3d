/** Symbols printed on the cable tags and on the "LIVE" sticker. */
export const SYMBOLS = ['circle', 'triangle', 'square', 'diamond'] as const;
export type WireSymbol = (typeof SYMBOLS)[number];

export const WIRE_COLORS = ['#ff3b5c', '#00f0ff', '#ffb800', '#8b5cff'] as const;

export interface WiringRound {
  /** Symbol shown on the sticker inside the door. */
  live: WireSymbol;
  /** Symbol on each cable's tag, left to right. */
  tags: WireSymbol[];
}

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** New random round: tags reshuffle after every wrong guess. */
export function createRound(): WiringRound {
  const tags = shuffle(SYMBOLS);
  return { live: tags[Math.floor(Math.random() * tags.length)], tags };
}

export const isCorrect = (round: WiringRound, wireIndex: number) => round.tags[wireIndex] === round.live;
