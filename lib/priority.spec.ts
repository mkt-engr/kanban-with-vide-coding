import { describe, expect, it } from "vitest";
import { getPriorityColor, getPriorityLabel } from "./priority";

describe("getPriorityLabel", () => {
  it("LOWの場合「低」を返す", () => {
    expect(getPriorityLabel("LOW")).toBe("低");
  });

  it("MEDIUMの場合「中」を返す", () => {
    expect(getPriorityLabel("MEDIUM")).toBe("中");
  });

  it("HIGHの場合「高」を返す", () => {
    expect(getPriorityLabel("HIGH")).toBe("高");
  });

  it("URGENTの場合「緊急」を返す", () => {
    expect(getPriorityLabel("URGENT")).toBe("緊急");
  });
});

describe("getPriorityColor", () => {
  it("LOWの場合グレーのクラスを返す", () => {
    expect(getPriorityColor("LOW")).toBe("bg-gray-100 text-gray-700");
  });

  it("MEDIUMの場合ブルーのクラスを返す", () => {
    expect(getPriorityColor("MEDIUM")).toBe("bg-blue-100 text-blue-700");
  });

  it("HIGHの場合オレンジのクラスを返す", () => {
    expect(getPriorityColor("HIGH")).toBe("bg-orange-100 text-orange-700");
  });

  it("URGENTの場合レッドのクラスを返す", () => {
    expect(getPriorityColor("URGENT")).toBe("bg-red-100 text-red-700");
  });
});
