import { describe, expect, it } from "vitest";

describe("serial format", () => {
  it("documents PackSlip serial shape", () => {
    const serial = `SLIP-${new Date("2026-05-16").getFullYear()}-${String(1).padStart(6, "0")}`;
    expect(serial).toBe("SLIP-2026-000001");
  });
});
