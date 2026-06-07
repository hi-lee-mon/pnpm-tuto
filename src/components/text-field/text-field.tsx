import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";

export type TextFieldSize = "sm" | "md" | "lg";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  description?: ReactNode;
  error?: ReactNode;
  label?: ReactNode;
  size?: TextFieldSize;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, description, error, id, label, size = "md", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cx("hui-TextField", className)} data-invalid={error ? "" : undefined} data-size={size}>
        {label ? (
          <label className="hui-TextField-label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="hui-TextField-input"
          id={inputId}
          {...props}
        />
        {description ? (
          <div className="hui-TextField-description" id={descriptionId}>
            {description}
          </div>
        ) : null}
        {error ? (
          <div className="hui-TextField-error" id={errorId}>
            {error}
          </div>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = "TextField";
