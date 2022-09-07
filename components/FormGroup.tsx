import Form from "react-bootstrap/Form";

export interface FormProps {
  className?: string;
  labelText?: string;
  formText?: string;
  formType?: "text" | "email" | "password";
  placeHolder?: string;
  onChange: any;
}

export default function FormGroup({
  className,
  labelText,
  formText,
  placeHolder,
  formType,
  onChange,
}: FormProps) {
  return (
    <Form.Group className={className}>
      {labelText && <Form.Label>{labelText}</Form.Label>}
      <Form.Control type={formType || "text"} placeholder={placeHolder || ""} />
      {formText && <Form.Text onChange={onChange}>{formText}</Form.Text>}
    </Form.Group>
  );
}
