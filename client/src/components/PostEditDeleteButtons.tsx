import { Reference } from "@apollo/client";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { PaginatedPosts, useDeletePostMutation } from "../generated/graphql";

interface PostEditDeleteButtonsProps {
  postId: string;
  to?: string | null;
}

const PostEditDeleteButtons = ({ postId, to }: PostEditDeleteButtonsProps) => {
  const [deletePost, _] = useDeletePostMutation();

  const router = useRouter();

  const onDeletePost = async (postId: string) => {
    await deletePost({
      variables: {
        id: postId,
      },
      update(cache, { data }) {
        if (data?.deletePost.success) {
          cache.modify({
            fields: {
              posts(
                existing: Pick<
                  PaginatedPosts,
                  "__typename" | "cursor" | "hasMore" | "totalCount"
                > & { paginatedPosts: Reference[] }
              ) {
                const newPostsAfterDeletion = {
                  ...existing,
                  totalCount: existing.totalCount - 1,
                  paginatedPosts: existing.paginatedPosts.filter(
                    (postRefObject) => postRefObject.__ref !== `Post:${postId}`
                  ),
                };

                return newPostsAfterDeletion;
              },
            },
          });
        }
      },
    });

    if (to) {
      router.push(to);
    }
  };

  return (
    <Box>
      <NextLink href={`/post/edit/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
      </NextLink>

      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete"
        colorScheme={"red"}
        onClick={() => onDeletePost(postId)}
      />
    </Box>
  );
};

export default PostEditDeleteButtons;
