export const isTaskExpired = (dueDate: Date | null): boolean => {
  if (!dueDate) return false;
  return new Date() > dueDate;
};

export const getExpiredDaysText = (dueDate: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - dueDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return "今日期限切れ";
  } else if (diffInDays === 1) {
    return "1日前に期限切れ";
  } else {
    return `${diffInDays}日前に期限切れ`;
  }
};

export const formatDueDate = (dueDate: Date): string => {
  return dueDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

export const countExpiredTasks = (tasks: Array<{ dueDate: Date | null }>): number => {
  return tasks.filter(task => task.dueDate && isTaskExpired(task.dueDate)).length;
};