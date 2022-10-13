import ProgressBar from "react-bootstrap/ProgressBar";

export interface ProgressProps {
  value: number;
  className?: string;
}

export default function Progress({ value, className }: ProgressProps) {
  const perc = Math.round(value);

  return (
    <ProgressBar
      style={{ height: 50, padding: 10 }}
      className={className}
      now={value}
      label={`${perc}%`}
    />
  );
}
