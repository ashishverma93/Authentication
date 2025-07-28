"use client";

import { useUserContext } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useRedirect = (redirect: string) => {
  const { userLoginStatus } = useUserContext();

  const router = useRouter();

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const isLoggedInUser = await userLoginStatus();
        console.log("isLoggedInUser: " + isLoggedInUser);
        if (isLoggedInUser) router.push(redirect);
      } catch (error) {
        console.log("Error redirecting user: " + error);
      }
    };
    redirectUser();
  }, [redirect, userLoginStatus, router]);
};

export default useRedirect;