import { NetworkStatus } from "@apollo/client";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import NextLink from "next/link";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import PostEditDeleteButtons from "../components/PostEditDeleteButtons";
import UpvoteSection from "../components/UpvoteSection";
import { PostsDocument, useMeQuery, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";

export const LIMIT = 5;

const Index = () => {
  const { data: meData } = useMeQuery();

  const { data, loading, fetchMore, networkStatus } = usePostsQuery({
    variables: {
      limit: LIMIT,
    },

    // component nào render bởi post query, sẽ render lại khi NetworkStatus thay đổi tức là fetchMore
    notifyOnNetworkStatusChange: true,
  });

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore;

  const loadMorePosts = () => {
    fetchMore({
      variables: {
        cursor: data?.posts?.cursor,
      },
    });
  };

  return (
    <>
      <Layout>
        {loading && !loadingMorePosts ? (
          <LoadingSpinner />
        ) : (
          <Stack spacing={8}>
            {data?.posts?.paginatedPosts.map((post) => (
              <Flex
                key={post.id}
                p={5}
                shadow={"md"}
                borderWidth={"1px"}
                alignItems="center">
                <UpvoteSection post={post} />

                <Box flex={1}>
                  <NextLink href={`/post/${post.id}`} passHref legacyBehavior>
                    <Link>
                      <Heading fontSize={"xl"}>{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>{new Date(post.updatedAt).toLocaleString()}</Text>

                  <Text> posted by {post.user.username}</Text>
                  <Flex align={"center"}>
                    <Text maxW="85%">
                      {post.textSnippet}
                      {post.text.split(" ").length > 20 && (
                        <NextLink
                          href={`/post/${post.id}`}
                          passHref
                          legacyBehavior>
                          <Link fontWeight={500}>Xem thêm</Link>
                        </NextLink>
                      )}
                    </Text>

                    <Box ml="auto">
                      {meData?.me?.id === post.user.id && (
                        <PostEditDeleteButtons postId={post.id} />
                      )}
                    </Box>
                  </Flex>
                  {post.image && (
                    <Image
                      m="auto"
                      mt={4}
                      maxHeight="550"
                      objectFit={"cover"}
                      src={post?.image as string}
                      alt={post.title}
                    />
                  )}
                </Box>
              </Flex>
            ))}
            {data?.posts?.hasMore && (
              <Flex justifyContent="center">
                <Button
                  type="button"
                  my={8}
                  isLoading={loadingMorePosts}
                  onClick={loadMorePosts}>
                  {loadingMorePosts ? "loading" : "Show more"}
                </Button>
              </Flex>
            )}
          </Stack>
        )}
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const apolloClient = initializeApollo({
    headers: context.req.headers,
  });

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit: LIMIT,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;
