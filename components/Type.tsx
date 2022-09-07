import React from "react";

export interface TypeProps {
  as: string;
  variant: string;
  style?: any;
  className?: string;
  children: any;
}

export default function Type({
  as,
  variant,
  className,
  children,
  style,
}: TypeProps) {
  if (as == "h1") {
    return (
      <h1 style={style} className={`${variant} ${className || ""}`}>
        {children}
      </h1>
    );
  } else if (as == "h2") {
    return (
      <h2 style={style} className={`${variant} ${className || ""}`}>
        {children}
      </h2>
    );
  } else if (as == "h3") {
    return (
      <h3 style={style} className={`${variant} ${className || ""}`}>
        {children}
      </h3>
    );
  } else if (as == "h4") {
    return (
      <h4 style={style} className={`${variant} ${className || ""}`}>
        {children}
      </h4>
    );
  } else if (as == "h5") {
    return (
      <h5 style={style} className={`${variant} ${className || ""}`}>
        {children}
      </h5>
    );
  } else if (as == "p") {
    return (
      <p style={style} className={`mb-0 ${variant} ${className || ""}`}>
        {children}
      </p>
    );
  } else if (as == "span") {
    return (
      <span style={style} className={`mb-0 ${variant} ${className || ""}`}>
        {children}
      </span>
    );
  } else {
    return (
      <div style={style} className={`mb-0 ${variant} ${className || ""}`}>
        {children}
      </div>
    );
  }
}
