import Spinner from "react-bootstrap/Spinner";

export interface LoadingProps {
  className?: string;
}

export default function LoadingIndicator({ className }: LoadingProps) {
  return (
    <Spinner
      animation="border"
      role="status"
      className={className}
      style={{ width: "3rem", height: "3rem" }}
    >
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
