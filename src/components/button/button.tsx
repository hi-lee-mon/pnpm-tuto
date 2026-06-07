import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cx } from "../../utils/cx";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, size = "md", type = "button", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cx("hui-Button", className)}
        data-size={size}
        data-variant={variant}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
