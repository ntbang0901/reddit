import { Flex, Spinner } from "@chakra-ui/react";
import React from "react";

const LoadingSpinner = () => {
  return (
    <Flex justifyContent="center" alignItems="center" minH="100vh">
      <Spinner />
    </Flex>
  );
};

export default LoadingSpinner;
