import { Box, Button, Flex, Link, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import LoadingSpinner from "../components/LoadingSpinner";
import Wrapper from "../components/Wrapper";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErroes";
import { useCheckAuth } from "../utils/useCheckAuth";

const initialValues: RegisterInput = {
  username: "",
  password: "",
  email: "",
};

const Register = () => {
  const router = useRouter();
  const toast = useToast();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const [registerUser, { loading: _registerUserLoading }] =
    useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register?.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.register.user },
          });
        }
      },
    });

    if (response.data?.register?.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register?.user) {
      toast({
        title: "Welcome",
        description: `${response.data?.register.user?.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      router.push("/");
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <LoadingSpinner />
      ) : (
        <Wrapper size="small">
          <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="username"
                  placeholder="Username"
                  label="Username"
                  type="text"
                />
                <Box mt={4}>
                  <InputField
                    name="email"
                    placeholder="Email"
                    label="Email"
                    type="text"
                  />
                </Box>
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
                    mt={4}
                    isLoading={isSubmitting}>
                    Register
                  </Button>
                  <Flex flexDirection={"column"}>
                    <NextLink href="/forgot-password" passHref legacyBehavior>
                      <Link ml="auto">Forgot Password</Link>
                    </NextLink>
                    <NextLink href="/login" passHref legacyBehavior>
                      <Link ml="auto">Login</Link>
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

export default Register;
