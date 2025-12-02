"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import React, { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: "smooth" | "instant";
  resize?: "smooth" | "instant";
  role?: string;
};

export const Conversation = ({
  className,
  initial = "smooth",
  resize = "smooth",
  role = "log",
  children,
  ...props
}: ConversationProps) => {
  const StickToBottomComponent = StickToBottom as React.ComponentType<{
    initial?: boolean;
    resize?: boolean;
    role?: string;
    children?: React.ReactNode;
  }>;

  return (
    <div
      className={cn("relative flex-1 overflow-y-auto", className)}
      {...props}
    >
      <StickToBottomComponent
        initial={initial === "smooth" ? true : false}
        resize={resize === "smooth" ? true : false}
        role={role}
      >
        {children}
      </StickToBottomComponent>
    </div>
  );
};

export type ConversationContentProps = React.HTMLAttributes<HTMLDivElement>;

export const ConversationContent = ({
  className,
  children,
  ...props
}: ConversationContentProps) => {
  const Content = StickToBottom.Content as React.ComponentType<{
    children?: React.ReactNode;
  }>;
  return (
    <div className={cn("p-4", className)} {...props}>
      <Content>{children}</Content>
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
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full",
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
