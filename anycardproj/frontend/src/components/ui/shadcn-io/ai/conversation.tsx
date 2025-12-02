'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

export type ConversationProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: "smooth" | "instant"
  resize?: "smooth" | "instant"
  role?: string
}

export const Conversation = ({ className, initial = "smooth", resize = "smooth", role = "log", children, ...props }: ConversationProps) => {
  return (
    <div className={cn('relative flex-1 overflow-y-auto', className)} {...props}>
      <StickToBottom
        initial={initial}
        resize={resize}
        role={role}
      >
        {children}
      </StickToBottom>
    </div>
  );
};

export type ConversationContentProps = React.HTMLAttributes<HTMLDivElement>;

export const ConversationContent = ({
  className,
  children,
  ...props
}: ConversationContentProps) => {
  return (
    <div className={cn('p-4', className)} {...props}>
      <StickToBottom.Content>
        {children}
      </StickToBottom.Content>
    </div>
  );
};

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full',
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...(props as any)}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
