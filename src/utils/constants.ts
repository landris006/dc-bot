import { ColorResolvable } from 'discord.js';

export namespace Constants {
  export const MILISECONDS_TO_HOURS = 2.77777778e-7;
  export const MILISECONDS_TO_SECONDS = 1e-3;

  export const LEVEL_TO_COLOR_MAP = new Map<number, ColorResolvable>([
    [0, 'White'],
    [1, 'Blue'],
    [2, 'Green'],
    [3, 'Yellow'],
    [4, 'Orange'],
    [5, 'Red'],
    [6, 'Purple'],
    [7, 'DarkVividPink'],
    [8, 'Grey'],
    [9, 'LuminousVividPink'],
  ]);

  export const HOURS_TO_LEVEL = (hoursActive: number) => {
    if (hoursActive < 1) {
      return 1;
    }

    return Math.trunc(Math.log2(hoursActive)) + 1;
  };
}
