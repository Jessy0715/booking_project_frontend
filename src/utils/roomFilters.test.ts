import { normalizeFacility, parseMinCapacity } from "./roomFilters";

describe("parseMinCapacity", () => {
  it("空白視為不篩選", () => {
    expect(parseMinCapacity("   ")).toEqual({});
  });

  it("去頭尾空白後解析正整數", () => {
    expect(parseMinCapacity(" 8 ")).toEqual({ value: 8 });
  });

  it.each(["-3", "abc", "1.5", "1e3", "0"])("拒絕 %s", (raw) => {
    expect(parseMinCapacity(raw).error).toBeDefined();
  });

  it("拒絕過大的數字", () => {
    expect(parseMinCapacity("99999999999").error).toBeDefined();
  });
});

describe("normalizeFacility", () => {
  it("去頭尾空白", () => {
    expect(normalizeFacility("  柔光箱 ")).toBe("柔光箱");
  });

  it("空白回傳 undefined", () => {
    expect(normalizeFacility("   ")).toBeUndefined();
  });
});
