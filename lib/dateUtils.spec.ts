import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isTaskExpired, getExpiredDaysText, formatDueDate, countExpiredTasks } from "./dateUtils";

describe("date-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isTaskExpired", () => {
    it("期限がnullの場合はfalseを返す", () => {
      expect(isTaskExpired(null)).toBe(false);
    });

    it("期限が現在時刻より前の場合はtrueを返す", () => {
      const pastDate = new Date("2024-01-14T12:00:00Z");
      expect(isTaskExpired(pastDate)).toBe(true);
    });

    it("期限が現在時刻より後の場合はfalseを返す", () => {
      const futureDate = new Date("2024-01-16T12:00:00Z");
      expect(isTaskExpired(futureDate)).toBe(false);
    });

    it("期限が現在時刻と同じ場合はfalseを返す", () => {
      const sameDate = new Date("2024-01-15T12:00:00Z");
      expect(isTaskExpired(sameDate)).toBe(false);
    });
  });

  describe("getExpiredDaysText", () => {
    it("今日期限切れの場合は正しいテキストを返す", () => {
      const todayDate = new Date("2024-01-15T06:00:00Z");
      expect(getExpiredDaysText(todayDate)).toBe("今日期限切れ");
    });

    it("1日前に期限切れの場合は正しいテキストを返す", () => {
      const oneDayAgo = new Date("2024-01-14T12:00:00Z");
      expect(getExpiredDaysText(oneDayAgo)).toBe("1日前に期限切れ");
    });

    it("複数日前に期限切れの場合は正しいテキストを返す", () => {
      const threeDaysAgo = new Date("2024-01-12T12:00:00Z");
      expect(getExpiredDaysText(threeDaysAgo)).toBe("3日前に期限切れ");
    });
  });

  describe("formatDueDate", () => {
    it("日付を日本語形式でフォーマットする", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      expect(formatDueDate(date)).toBe("2024/1/15");
    });
  });

  describe("countExpiredTasks", () => {
    it("期限切れタスクが0個の場合は0を返す", () => {
      const tasks = [
        { dueDate: new Date("2024-01-16T12:00:00Z") },
        { dueDate: new Date("2024-01-17T12:00:00Z") },
        { dueDate: null },
      ];
      expect(countExpiredTasks(tasks)).toBe(0);
    });

    it("期限切れタスクがある場合は正しい数を返す", () => {
      const tasks = [
        { dueDate: new Date("2024-01-14T12:00:00Z") }, // 期限切れ
        { dueDate: new Date("2024-01-13T12:00:00Z") }, // 期限切れ
        { dueDate: new Date("2024-01-16T12:00:00Z") }, // 期限内
        { dueDate: null }, // 期限なし
      ];
      expect(countExpiredTasks(tasks)).toBe(2);
    });

    it("空の配列の場合は0を返す", () => {
      expect(countExpiredTasks([])).toBe(0);
    });
  });
});