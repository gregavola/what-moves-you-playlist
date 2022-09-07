import React, { ReactNode } from "react";
import Modal from "react-bootstrap/Modal";

export interface DialogProps {
  title?: string;
  body: ReactNode;
  onClose: any;
  id?: string;
  "aria-label"?: string;
  dialogTitle: string;
  footer: ReactNode;
}

export default function DialogFullScreen({
  title,
  footer,
  body,
  dialogTitle,
  onClose,
}: DialogProps) {
  return (
    <Modal show={true} fullscreen={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title || dialogTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>{footer}</Modal.Footer>
    </Modal>
  );
}
