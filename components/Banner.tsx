import Alert from "react-bootstrap/Alert";

export interface AlertProps {
  className?: string;
  colorSet?: string;
  children: any;
}

export default function Banner({ className, colorSet, children }: AlertProps) {
  return (
    <Alert variant={colorSet} className={className}>
      {children}
    </Alert>
  );
}
