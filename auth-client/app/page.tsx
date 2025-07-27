"use client";

import { useUserContext } from "@/context/userContext";
import Image from "next/image";

export default function Home() {
  const { logoutUser } = useUserContext();
  const user = useUserContext();
  console.log("User:", user);
  return (
    <main className="py-[2rem] mx-[10rem]">
      <header className="flex items-center justify-center">
        <h1 className="text-[2rem]">
          Hey{" "}
          <span className="text-red-600">
            {user ? user.user?.name : "there"}
          </span>
          , Welcome to Auth Application.
        </h1>
        <div className="flex items-center gap-4">
          <img src={user?.user?.avatar} alt="user" />
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={logoutUser}
          >
            Logout
          </button>
        </div>
      </header>
    </main>
  );
}
