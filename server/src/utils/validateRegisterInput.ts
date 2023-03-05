import { RegisterInput } from "./../types/RegisterInput";
export const validateRegisterInput = (registerInput: RegisterInput) => {
  //Validate email
  if (!registerInput.email.includes("@")) {
    return {
      message: "Invalid email",
      errors: [
        {
          field: "email",
          message: "Email must include @ symbol",
        },
      ],
    };
  }
  //Validate username
  if (registerInput.username.length <= 2) {
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "length must be greater than 2",
        },
      ],
    };
  }

  if (registerInput.username.includes("@")) {
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "username cannot include @ ",
        },
      ],
    };
  }

  //Validate password
  if (registerInput.password.length <= 2) {
    return {
      message: "Invalid password",
      errors: [
        {
          field: "password",
          message: "length must be greater than 2",
        },
      ],
    };
  }

  return null;
};
