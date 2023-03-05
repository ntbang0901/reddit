import React from "react";
import { useField } from "formik";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  textarea?: boolean;
}

const InputField = ({ textarea, ...props }: InputFieldProps) => {
  const [filed, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={filed.name}>{props.label}</FormLabel>
      {textarea ? (
        <Textarea id={filed.name} {...props} {...filed} />
      ) : (
        <Input id={filed.name} {...props} {...filed} />
      )}

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
