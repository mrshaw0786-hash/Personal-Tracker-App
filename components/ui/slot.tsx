import * as React from "react";
import { cn } from "@/lib/utils";

// Minimal Slot: merges props/className onto a single child element.
export const Slot = React.forwardRef<HTMLElement, { children: React.ReactNode } & Record<string, unknown>>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    return React.cloneElement(child, {
      ...props,
      ...childProps,
      className: cn(props.className as string, childProps.className as string),
      ref,
    } as Record<string, unknown>);
  },
);
Slot.displayName = "Slot";
