import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { CreatePostInput, UpdatePostInput } from "../generated/graphql";
import InputField from "./InputField";

interface CreateOrEditPostProps {
  initialValues: CreatePostInput | UpdatePostInput;
  onSubmit: (
    values: CreatePostInput | Omit<UpdatePostInput, "id">
  ) => Promise<void>;
  labelButton?: string;
}

const CreateOrEditPost = ({
  initialValues,
  onSubmit,
  labelButton = "Button",
}: CreateOrEditPostProps) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form>
          <InputField
            name="title"
            placeholder="Title"
            label="Title"
            type="text"
          />

          <Box mt={4}>
            <InputField
              name="text"
              placeholder="Text"
              label="Text"
              type="text"
              textarea
            />
          </Box>
          <Box mt={4}>
            <InputField
              name="image"
              placeholder="URL Image"
              label="URL Image"
              type="text"
            />
          </Box>

          <Flex alignItems={"center"} justifyContent="space-between">
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}>
              {labelButton}
            </Button>
            <NextLink href={"/"} passHref legacyBehavior>
              <Button mt={4}>Go back to Homepage</Button>
            </NextLink>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default CreateOrEditPost;
