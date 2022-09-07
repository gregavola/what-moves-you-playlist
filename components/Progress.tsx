import ProgressBar from "react-bootstrap/ProgressBar";

export interface ProgressProps {
  value: number;
  variant?: "success" | "info" | "warning" | "danger";
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

export default function Progress({
  value,
  className,
  striped,
  variant,
  animated,
}: ProgressProps) {
  const perc = value;

  return (
    <ProgressBar
      animated={animated}
      striped={striped}
      variant={variant || "info"}
      className={className}
      now={value}
      label={`${perc}%`}
    />
  );
}
