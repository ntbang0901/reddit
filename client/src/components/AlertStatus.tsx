import { Alert, AlertIcon, AlertTitle, Box, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import Layout from "./Layout";

interface AlertStatusProps {
  status: "loading" | "error" | "info" | "warning" | "success";
  message: string;
}

const AlertStatus = ({ status, message }: AlertStatusProps) => {
  return (
    <Layout>
      <Alert status={status}>
        <AlertIcon />
        <AlertTitle>{message}</AlertTitle>
      </Alert>
      <Box mt={4}>
        <NextLink href="/">
          <Button>Back to Homepage</Button>
        </NextLink>
      </Box>
    </Layout>
  );
};

export default AlertStatus;
