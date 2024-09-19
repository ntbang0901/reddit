import { DataSource } from "typeorm"
import { Post } from "./entities/Post"
import { Upvote } from "./entities/Upvote"
import { User } from "./entities/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: "reddit-for-migrations",
    entities: [User, Post, Upvote],
    migrations: [],
})
