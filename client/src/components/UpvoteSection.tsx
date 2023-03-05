import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import {
  PostWithUserInfoFragment,
  useVoteMutation,
  VoteType,
} from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment;
}

enum VoteTypeValues {
  UpVote = 1,
  DownVote = -1,
}

const UpvoteSection = ({ post }: UpvoteSectionProps) => {
  const [vote, { loading }] = useVoteMutation();

  // const { data: meData } = useMeQuery();

  // const { data: dataVote } = useGetVoteQuery({
  //   variables: {
  //     postId: parseInt(post.id),
  //     userId: parseInt(meData?.me?.id as string),
  //   },
  // });

  const upvote = async (
    post: PostWithUserInfoFragment,
    inputVoteValue: VoteType
  ) => {
    await vote({
      variables: {
        inputVoteValue,
        postId: parseInt(post.id),
      },
    });
  };

  return (
    <Flex alignItems={"center"} flexDirection={"column"} mr={4}>
      <IconButton
        backgroundColor={post.voteType === 1 ? "blue.100" : ""}
        icon={<ChevronUpIcon />}
        aria-label="Upvote"
        onClick={() =>
          post.voteType === VoteTypeValues.UpVote
            ? undefined
            : upvote(post, VoteType.Upvote)
        }
      />
      <Text>{post.points}</Text>
      <IconButton
        backgroundColor={post.voteType === -1 ? "red.100" : ""}
        icon={<ChevronDownIcon />}
        aria-label="Downvote"
        onClick={() =>
          post.voteType === VoteTypeValues.DownVote
            ? undefined
            : upvote(post, VoteType.Downvote)
        }
      />
    </Flex>
  );
};

export default UpvoteSection;
