import { cn } from "@/lib/utils";
import { type Priority, getPriorityLabel, getPriorityColor } from "@/lib/priority";

type Props = {
  priority: Priority;
  className?: string;
};

export const PriorityBadge = ({ priority, className }: Props) => {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        getPriorityColor(priority),
        className
      )}
    >
      {getPriorityLabel(priority)}
    </span>
  );
};