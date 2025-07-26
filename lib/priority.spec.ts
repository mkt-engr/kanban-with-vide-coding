import { describe, expect, test } from "vitest";
import { getPriorityColor, getPriorityLabel } from "./priority";

describe("getPriorityLabel", () => {
  test("LOWの場合「低」を返す", () => {
    expect(getPriorityLabel("LOW")).toBe("低");
  });

  test("MEDIUMの場合「中」を返す", () => {
    expect(getPriorityLabel("MEDIUM")).toBe("中");
  });

  test("HIGHの場合「高」を返す", () => {
    expect(getPriorityLabel("HIGH")).toBe("高");
  });

  test("URGENTの場合「緊急」を返す", () => {
    expect(getPriorityLabel("URGENT")).toBe("緊急");
  });
});

describe("getPriorityColor", () => {
  test("LOWの場合グレーのクラスを返す", () => {
    expect(getPriorityColor("LOW")).toBe("bg-gray-100 text-gray-700");
  });

  test("MEDIUMの場合ブルーのクラスを返す", () => {
    expect(getPriorityColor("MEDIUM")).toBe("bg-blue-100 text-blue-700");
  });

  test("HIGHの場合オレンジのクラスを返す", () => {
    expect(getPriorityColor("HIGH")).toBe("bg-orange-100 text-orange-700");
  });

  test("URGENTの場合レッドのクラスを返す", () => {
    expect(getPriorityColor("URGENT")).toBe("bg-red-100 text-red-700");
  });
});
