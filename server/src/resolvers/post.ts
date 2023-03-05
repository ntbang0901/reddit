import { Upvote } from "./../entities/Upvote";
import { PaginatedPosts } from "./../types/PaginatedPosts";
import { User } from "./../entities/User";
import { checkAuth } from "./../middlewares/checkAuth";
import { UpdatePostInput } from "./../types/UpdatePostInput";
import { Context } from "./../types/Context";
import { Post } from "./../entities/Post";
import { CreatePostInput } from "./../types/CreatePostInput";
import { PostMutationResponse } from "./../types/PostMutaionResponse";
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { LessThan } from "typeorm";
import { VoteType } from "../types/VoteType";
import { UserInputError } from "apollo-server-core";

registerEnumType(VoteType, {
  name: "VoteType",
});

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_return) => String)
  textSnippet(@Root() root: Post) {
    let string = root.text.split(" ");
    string.length = 20;
    return string.join(" ");
  }

  @FieldResolver((_return) => Int)
  async voteType(
    @Root() root: Post,
    @Ctx() { req, dataLoaders: { voteTypeLoader } }: Context
  ) {
    console.log(req.session.userId);
    if (!req.session.userId) return 0;

    const existingVote = await voteTypeLoader.load({
      postId: root.id,
      userId: req.session.userId,
    });

    return existingVote ? existingVote.value : 0;
  }

  @FieldResolver((_return) => User)
  async user(
    @Root() root: Post,
    @Ctx() { dataLoaders: { userLoader } }: Context
  ) {
    // return await User.findOne(root.userId)
    return await userLoader.load(root.userId);
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") createPostInput: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const userId = req.session.userId;
      const newPost = Post.create({
        userId,
        ...createPostInput,
      });

      await newPost.save();

      return {
        code: 200,
        success: true,
        post: newPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Query((_return) => PaginatedPosts, { nullable: true })
  async posts(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPostCount = await Post.count();
      const realLimit = Math.min(10, limit);

      const findOptions: { [key: string]: any } = {
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
      };

      let lastPost: Post[] = [];

      if (cursor) {
        findOptions.where = {
          createdAt: LessThan(cursor),
        };

        lastPost = await Post.find({
          order: {
            createdAt: "ASC",
          },
          take: 1,
        });
      }

      const posts = await Post.find(findOptions);
      return {
        totalCount: totalPostCount,
        cursor: posts[posts.length - 1].createdAt,
        hasMore: cursor
          ? posts[posts.length - 1].createdAt.toString() !==
            lastPost[0].createdAt.toString()
          : posts.length !== totalPostCount,
        paginatedPosts: posts,
      };
    } catch (error) {
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
    try {
      const post = await Post.findOne({
        where: {
          id,
        },
      });
      return post;
    } catch (error) {
      return null;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { id, title, text, image }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id } });
      if (!existingPost)
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };

      if (existingPost.userId !== req.session.userId) {
        return {
          code: 401,
          success: false,
          message: "Unauthorized",
        };
      }
      existingPost.title = title;
      existingPost.text = text;
      existingPost.image = image;
      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: "Updated post successfully",
        post: existingPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", (_type) => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id } });
      if (!existingPost)
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };

      if (existingPost.userId !== req.session.userId) {
        return {
          code: 401,
          success: false,
          message: "Unauthorized",
        };
      }

      await Post.delete({
        id,
      });

      return {
        code: 200,
        success: true,
        message: "Post deleted successfully",
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg("postId", (_type) => Int) postId: number,
    @Arg("inputVoteValue", (_type) => VoteType) inputVoteValue: VoteType,
    @Ctx() { req, connection }: Context
  ): Promise<PostMutationResponse> {
    const userId = req.session.userId;

    return await connection.transaction(async (transactionEntityManager) => {
      //  check post exists
      let post = await transactionEntityManager.findOne(Post, {
        where: {
          id: postId,
        },
      });
      if (!post) {
        throw new UserInputError("Post not found");
      }

      //  check vote exists

      let existingVote = await transactionEntityManager.findOne(Upvote, {
        where: {
          userId,
          postId,
        },
      });

      if (existingVote && existingVote.value !== inputVoteValue) {
        await transactionEntityManager.save(Upvote, {
          ...existingVote,
          value: inputVoteValue,
        });

        console.log(existingVote);

        post = await transactionEntityManager.save(Post, {
          ...post,
          points: post.points + 2 * inputVoteValue,
        });
      }

      if (!existingVote) {
        const newVote = await transactionEntityManager.create(Upvote, {
          userId,
          postId,
          value: inputVoteValue,
        });

        await transactionEntityManager.save(newVote);
        post.points = post.points + inputVoteValue;
        post = await transactionEntityManager.save(post);
      }

      return {
        code: 200,
        success: true,
        message: "Post voted",
        post,
      };
    });
  }
}
