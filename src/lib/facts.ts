// Numbers in copy, for the fact test (Plan 2 Task 2): every number shown must have a source.
// A number is digits with optional , or . groups and an optional × or %. Bare single digits ("3 people") are left
// out as too common to trace; with × or % they are a claim and stay. Digits inside a word (ECE338, H.264) are names.
const NUMBER = /(?<![\p{L}\d.,])\d+(?:[.,]\d+)*(?:×\d+(?:[.,]\d+)*)?[×%]?/gu; // 640×480 is one number

export const numbersIn = (text: string): string[] => [...text.matchAll(NUMBER)].map((m) => m[0]).filter((n) => !/^\d$/.test(n));

// The number appears whole in the source: not as part of a longer number (21× is not sourced by 21.49×).
export const sourced = (n: string, source: string): boolean => {
  const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\d.,]|\\d[.,])${esc}(?![\\d]|[.,]\\d)`, 'u').test(source);
};
