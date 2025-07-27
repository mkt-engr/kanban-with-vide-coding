import { type Priority } from "@/models/priority";

export const getPriorityLabel = (priority: Priority): string => {
  switch (priority) {
    case "LOW":
      return "低";
    case "MEDIUM":
      return "中";
    case "HIGH":
      return "高";
    case "URGENT":
      return "緊急";
    default:
      return "中";
  }
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case "LOW":
      return "bg-gray-100 text-gray-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "URGENT":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
};
