import { Arg, Int, Query, Resolver } from "type-graphql";
import { Upvote } from "./../entities/Upvote";

@Resolver((_of) => Upvote)
export class UpvoteResolver {
  @Query((_return) => Upvote, { nullable: true })
  async getVote(
    @Arg("userId", (_type) => Int, { nullable: true }) userId: number,
    @Arg("postId", (_type) => Int) postId: number
  ): Promise<Upvote | null> {
    try {
      let vote = await Upvote.findOne({
        where: {
          userId,
          postId,
        },
      });
      console.log(vote);
      return vote;
    } catch (error) {
      return null;
    }
  }
}
