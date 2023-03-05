import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @PrimaryColumn()
  userId!: number;

  @ManyToOne((_to) => User, (user) => user.upvotes)
  user!: User;

  @Field()
  @PrimaryColumn()
  postId!: number;

  @ManyToOne((_to) => Post, (post) => post.upvotes, {
    onDelete: "CASCADE",
  })
  post!: Post;

  @Field()
  @Column()
  value!: number;
}
