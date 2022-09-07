import React from "react";
import Button from "react-bootstrap/Button";

export interface ButtonProps {
  className?: string;
  onClick: any;
  buttonSize: "sm" | "lg";
  children: any;
}

export default function ButtonPrimary({
  className,
  onClick,
  children,
  buttonSize,
}: ButtonProps) {
  return (
    <Button
      variant="primary"
      size={buttonSize}
      className={className}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
