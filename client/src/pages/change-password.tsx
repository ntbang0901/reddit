import { Box, Button, Flex, Link, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import AlertStatus from "../components/AlertStatus";
import InputField from "../components/InputField";
import LoadingSpinner from "../components/LoadingSpinner";
import Wrapper from "../components/Wrapper";
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErroes";
import { useCheckAuth } from "../utils/useCheckAuth";

const initialValues: ChangePasswordInput = {
  newPassword: "",
};

const ChangePassword = () => {
  const router = useRouter();

  const toast = useToast();

  const { query } = router;

  const [changePassword, { data }] = useChangePasswordMutation();

  const [tokenError, setTokenError] = useState("");

  const { data: authData, loading: authLoading } = useCheckAuth();

  const onChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (query.userId && query.token) {
      const response = await changePassword({
        variables: {
          userId: query.userId as string,
          token: query.token as string,
          changePasswordInput: values,
        },
        update(cache, { data }) {
          // const meData = cache.readQuery({ query: MeDocument });
          // console.log("meData", meData);
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: { me: data.changePassword.user },
            });
          }
        },
      });
      if (response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(response.data.changePassword.errors);
        if ("token" in fieldErrors) {
          setTokenError(fieldErrors.token);
          setErrors(fieldErrors);
        }
      } else if (response.data?.changePassword?.user) {
        toast({
          title: "Welcome",
          description: `${response.data?.changePassword.user?.username}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        router.push("/");
      }
    }
  };

  if (authLoading || (!authLoading && authData?.me)) {
    return <LoadingSpinner />;
  }

  if (!query.token || !query.userId) {
    return (
      <AlertStatus status="error" message="Invalid password change request" />
    );
  }

  if (data?.changePassword.success) {
    return (
      <AlertStatus status="success" message="Change password successfully" />
    );
  }

  return (
    <Wrapper>
      <h1>Quến mật khẩu</h1>
      <Formik initialValues={initialValues} onSubmit={onChangePasswordSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            {tokenError && (
              <Flex justifyContent={"space-between"}>
                <Box color={"red"} mr={2}>
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link ml={"auto"}>Go back to forgot password</Link>
                </NextLink>
              </Flex>
            )}
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}>
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;
