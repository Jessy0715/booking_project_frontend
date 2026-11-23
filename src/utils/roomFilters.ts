const MAX_CAPACITY = 10000;

export type ParsedMinCapacity = { value?: number; error?: string };

/** 容納人數：去頭尾空白；空字串視為不篩選；只接受正整數。 */
export const parseMinCapacity = (raw: string): ParsedMinCapacity => {
  const text = raw.trim();
  if (text === "") return {};
  if (!/^\d+$/.test(text)) return { error: "請輸入正整數" };
  const value = Number(text);
  if (value < 1) return { error: "人數必須大於 0" };
  if (value > MAX_CAPACITY) return { error: `人數不可超過 ${MAX_CAPACITY}` };
  return { value };
};

/** 設備名稱：去頭尾空白；空字串視為不篩選（回傳 undefined）。 */
export const normalizeFacility = (raw: string): string | undefined => {
  const text = raw.trim();
  return text === "" ? undefined : text;
};
