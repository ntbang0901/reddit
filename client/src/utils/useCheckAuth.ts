import { useRouter } from "next/router";
import { useMeQuery } from "../generated/graphql";
import { useEffect } from "react";

export const useCheckAuth = () => {
  const router = useRouter();

  const { data, loading } = useMeQuery();

  const pathCheckLogin = [
    "/login",
    "/register",
    "/forgot-password",
    "/change-password",
  ];

  useEffect(() => {
    if (!loading) {
      if (data?.me && pathCheckLogin.includes(router.route)) {
        router.replace("/");
      } else if (!data?.me && !pathCheckLogin.includes(router.route)) {
        router.replace("/login");
      }
    }
  }, [data, router, loading]);

  return { data, loading };
};
