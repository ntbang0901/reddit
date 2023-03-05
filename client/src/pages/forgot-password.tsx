import { Box, Button, Flex, Link, Spinner } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import React from "react";
import InputField from "../components/InputField";
import LoadingSpinner from "../components/LoadingSpinner";
import Wrapper from "../components/Wrapper";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const initialValues: ForgotPasswordInput = {
  email: "",
};

const ForgotPassword = () => {
  const [forgotPassword, { loading, data }] = useForgotPasswordMutation();
  const { data: authData, loading: authLoading } = useCheckAuth();

  const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({
      variables: {
        forgotPasswordInput: values,
      },
    });
  };

  if (authLoading || (!authLoading && authData?.me)) {
    return <LoadingSpinner />;
  }

  return (
    <Wrapper size="small">
      <h1>Quến mật khẩu</h1>
      <Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
        {({ isSubmitting }) =>
          !loading && data ? (
            <Box>
              Please check your inbox
              <NextLink href="/" passHref legacyBehavior>
                <Link color="blue"> | Trang chủ</Link>
              </NextLink>
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="email"
              />

              <Flex mt={2} alignItems="center" justifyContent="end">
                <NextLink href="/login">
                  <Link ml="auto">Back to Login</Link>
                </NextLink>
              </Flex>

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}>
                Send Reset Password Email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
