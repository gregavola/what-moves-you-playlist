import ProgressBar from "react-bootstrap/ProgressBar";

export interface ProgressProps {
  value: number;
  className?: string;
}

export default function Progress({ value, className }: ProgressProps) {
  const perc = value;

  return <ProgressBar className={className} now={value} label={`${perc}%`} />;
}
