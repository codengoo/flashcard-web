"use client";

import { useField } from "formik";
import { TextField, Label, Input, TextArea, FieldError } from "@heroui/react";

interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  as?: "input" | "textarea";
  rows?: number;
  isRequired?: boolean;
  className?: string;
}

export function FormField({
  name,
  label,
  placeholder,
  as = "input",
  rows = 3,
  isRequired,
  className = "w-full",
}: FormFieldProps) {
  const [field, meta, helpers] = useField<string>(name);
  const isInvalid = meta.touched && !!meta.error;

  return (
    <TextField
      value={field.value ?? ""}
      onChange={(v) => helpers.setValue(v)}
      onBlur={() => helpers.setTouched(true)}
      isRequired={isRequired}
      isInvalid={isInvalid}
      className={className}
    >
      <Label>{label}</Label>
      {as === "textarea" ? (
        <TextArea rows={rows} placeholder={placeholder} variant="secondary" />
      ) : (
        <Input placeholder={placeholder} variant="secondary" />
      )}
      {isInvalid && <FieldError>{meta.error}</FieldError>}
    </TextField>
  );
}
