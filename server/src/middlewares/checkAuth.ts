import { Context } from "./../types/Context";
import { MiddlewareFn } from "type-graphql";
import { AuthenticationError } from "apollo-server-core";

export const checkAuth: MiddlewareFn<Context> = async (
  { context: { req } },
  next
) => {
  if (!req.session.userId)
    throw new AuthenticationError(
      "Not authenticated to perform GraphQl operations"
    );

  return next();
};
