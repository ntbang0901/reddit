import { ChangePasswordInput } from "./../types/ChangePasswordInput";
import { TokenModel } from "./../models/token";
import { sendEmail } from "./../utils/sendEmail";
import { ForgotPasswordInput } from "./../types/ForgotPasswordInput";
import { COOKIE_NAME } from "../constant";
import { Context } from "../types/Context";
import { LoginInput } from "../types/LoginInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { RegisterInput } from "../types/RegisterInput";
import { UserMutationResponse } from "../types/UserMutaionResponse";
import argon2 from "argon2";
import { User } from "../entities/User";
import {
  Mutation,
  Resolver,
  Arg,
  Ctx,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { v4 as uuidv4 } from "uuid";

@Resolver((_of) => User)
export class UserResolver {
  @FieldResolver((_return) => String)
  email(@Root() user: User, @Ctx() { req }: Context) {
    return req.session.userId === user.id ? user.email : "";
  }

  @Query((_return) => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
    const userId = req.session.userId;
    if (!userId) return null;
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }

  @Mutation((_return) => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput(registerInput);

    if (validateRegisterInputErrors !== null) {
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      };
    }
    try {
      const { username, email, password } = registerInput;

      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser)
        return {
          code: 400,
          success: false,
          message: "Duplicate username or email",
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: `${
                existingUser.username === username ? "username" : "email"
              } already exists`,
            },
          ],
        };

      const hashedPassword = await argon2.hash(password);

      const newUser = User.create({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      req.session.userId = newUser.id;

      return {
        code: 200,
        success: true,
        message: "User registration successful",
        user: newUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const username = !usernameOrEmail.includes("@")
        ? { username: usernameOrEmail }
        : { email: usernameOrEmail };

      const existingUser = await User.findOne({
        where: username,
      });

      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or Email incorrect",
            },
          ],
        };
      }

      const passwordValid = await argon2.verify(
        existingUser.password,
        password
      );

      if (!passwordValid) {
        return {
          code: 400,
          success: false,
          message: "Wrong password",
          errors: [
            {
              field: "password",
              message: "Wrong password",
            },
          ],
        };
      }

      // Create session and return cookie

      req.session.userId = existingUser.id;

      console.log(req);

      return {
        code: 200,
        success: true,
        message: "Logged in successfully",
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log("DESTROYING SESSION ERROR", error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  @Mutation((_return) => Boolean)
  async forgotPassword(
    @Arg("forgotPasswordInput") forgotPasswordInput: ForgotPasswordInput
  ): Promise<boolean> {
    const user = await User.findOne({
      where: {
        email: forgotPasswordInput.email,
      },
    });

    if (!user) return true;

    await TokenModel.findOneAndDelete({ userId: `${user.id}` });

    const resetToken = uuidv4();

    const hashResetToken = await argon2.hash(resetToken);

    //Save token to database

    await new TokenModel({
      userId: `${user.id}`,
      token: hashResetToken,
    }).save();

    // send reset password link to user via email

    await sendEmail(
      forgotPasswordInput.email,
      ` <a href="http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}">Click here to reset your password</a>`
    );

    console.log(hashResetToken);

    return true;
  }

  @Mutation((_return) => UserMutationResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("userId") userId: string,
    @Arg("changePasswordInput") changePasswordInput: ChangePasswordInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    if (changePasswordInput.newPassword.length <= 2)
      return {
        code: 400,
        success: false,
        message: "Invalid password",
        errors: [
          { field: "newPassword", message: "Length must to greater than 2" },
        ],
      };

    try {
      const resetPasswordToken = await TokenModel.findOne({
        userId,
      });

      if (!resetPasswordToken)
        return {
          code: 400,
          success: false,
          message: "Invalid or expired password reset token",
          errors: [
            {
              field: "token",
              message: "Invalid or expired password reset token",
            },
          ],
        };

      const resetPasswordTokenValid = argon2.verify(
        resetPasswordToken.token,
        token
      );

      if (!resetPasswordTokenValid)
        return {
          code: 400,
          success: false,
          message: "Invalid or expired password reset token",
          errors: [
            {
              field: "token",
              message: "Invalid or expired password reset token",
            },
          ],
        };

      const userIdNum = parseInt(userId);
      const user = await User.findOne({
        where: {
          id: userIdNum,
        },
      });

      if (!user)
        return {
          code: 400,
          success: false,
          message: "User no longer exists",
          errors: [
            {
              field: "token",
              message: "User no longer exists",
            },
          ],
        };

      const passwordUpdated = await argon2.hash(
        changePasswordInput.newPassword
      );

      await User.update(
        {
          id: userIdNum,
        },
        { password: passwordUpdated }
      );

      await resetPasswordToken.deleteOne();

      req.session.userId = user.id;

      return {
        code: 200,
        success: true,
        message: "User password reset successfully",
        user,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }
}
