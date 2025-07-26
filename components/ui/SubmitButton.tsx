"use client";

import { Button } from "@/components/ui/Button";
import { useFormStatus } from "react-dom";

type Props = {
  children?: React.ReactNode;
  loadingText?: string;
};

export const SubmitButton = ({ children, loadingText }: Props) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? loadingText || "送信中..." : children}
    </Button>
  );
};
