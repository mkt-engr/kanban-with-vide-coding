'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';

type Props = {
  onClick: () => void;
  children?: React.ReactNode;
};

export const CancelButton = ({ onClick, children }: Props) => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={pending}
    >
      {children}
    </Button>
  );
};
