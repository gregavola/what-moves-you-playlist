import { ToastContainer } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";
import Type from "./Type";

export interface ToastProps {
  title?: string;
  body: string;
  show: boolean;
}

export default function ToastAlert({ title, body, show }: ToastProps) {
  return (
    <ToastContainer>
      <Toast show={show}>
        {title && (
          <Toast.Header>
            <Type variant="cello" as="h5" className="me-auto">
              {title}
            </Type>
          </Toast.Header>
        )}
        <Toast.Body>
          <Type variant="cello" as="p">
            {body}
          </Type>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
