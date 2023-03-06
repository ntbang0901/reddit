import { Box, Button, Flex, Link, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import LoadingSpinner from "../components/LoadingSpinner";
import Wrapper from "../components/Wrapper";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErroes";
import { initializeApollo } from "../lib/apolloClient";
import { useCheckAuth } from "../utils/useCheckAuth";

const initialValues: LoginInput = {
  usernameOrEmail: "",
  password: "",
};

const Login = () => {
  const router = useRouter();
  const toast = useToast();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const [loginUser, { loading: _loginUserLoading, error }] = useLoginMutation();

  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        // const meData = cache.readQuery({ query: MeDocument });
        // ("meData", meData);
        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.login.user },
          });
        }
      },
    });

    if (response.data?.login?.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else if (response.data?.login?.user) {
      toast({
        title: "Welcome",
        description: `${response.data?.login.user?.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    router.push("/");

    const apolloClient = initializeApollo();
    apolloClient.resetStore();
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <LoadingSpinner />
      ) : (
        <Wrapper size="small">
          {error && <p>Failed to login. Internal server error</p>}

          <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  placeholder="Username or Email"
                  label="Username or Email"
                  type="text"
                />

                <Box mt={4}>
                  <InputField
                    name="password"
                    placeholder="Password"
                    label="Password"
                    type="password"
                  />
                </Box>
                <Flex
                  mt={4}
                  alignItems="center"
                  justifyContent={"space-between"}>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={isSubmitting}>
                    Login
                  </Button>
                  <Flex flexDirection={"column"}>
                    <NextLink href="/forgot-password" passHref legacyBehavior>
                      <Link ml="auto">Forgot Password</Link>
                    </NextLink>
                    <NextLink href="/register" passHref legacyBehavior>
                      <Link ml="auto">Register</Link>
                    </NextLink>
                  </Flex>
                </Flex>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Login;
