import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { LIMIT } from "..";
import AlertStatus from "../../components/AlertStatus";
import Layout from "../../components/Layout";
import PostEditDeleteButtons from "../../components/PostEditDeleteButtons";
import {
  PostDocument,
  PostIdsDocument,
  PostIdsQuery,
  PostQuery,
  useMeQuery,
  usePostQuery,
} from "../../generated/graphql";
import { addApolloState, initializeApollo } from "../../lib/apolloClient";

const Post = () => {
  const router = useRouter();
  const { data: meData } = useMeQuery();
  const {
    data: postData,
    loading,
    error,
  } = usePostQuery({
    variables: { id: router.query.id as string },
  });

  if (loading)
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );

  if (error || !postData?.post)
    return (
      <AlertStatus
        status="error"
        message={error ? error.message : "Post not found"}
      />
    );

  return (
    <Layout>
      <Flex mt={4} justifyContent="space-between" alignItems="center">
        {/* <PostEditDeleteButtons
          postId={data.post.id}
          postUserId={data.post.userId.toString()}
        /> */}
        <NextLink href="/">
          <Button>Back to Homepage</Button>
        </NextLink>
        {meData?.me?.id.toString() === postData?.post?.userId.toString() && (
          <PostEditDeleteButtons to={"/"} postId={`${postData.post.id}`} />
        )}
      </Flex>
      <Heading>{postData.post.title}</Heading>
      <Text>{new Date(postData.post.createdAt).toLocaleString()}</Text>

      <Box mb={4}>{postData.post.text}</Box>
      {postData?.post.image && (
        <Image
          m="auto"
          mt={4}
          maxHeight="550"
          objectFit={"cover"}
          src={postData?.post?.image as string}
          alt={postData?.post.title}
        />
      )}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = initializeApollo();

  const { data } = await apolloClient.query<PostIdsQuery>({
    query: PostIdsDocument,
    variables: {
      limit: LIMIT,
    },
  });

  return {
    paths: data.posts!.paginatedPosts.map((post) => ({
      params: {
        id: `${post.id}`,
      },
    })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<
  { [key: string]: any },
  { id: string }
> = async ({ params }) => {
  const apolloClient = initializeApollo();

  await apolloClient.query<PostQuery>({
    query: PostDocument,
    variables: {
      id: params?.id,
    },
  });

  return addApolloState(apolloClient, { props: {} });
};

export default Post;
