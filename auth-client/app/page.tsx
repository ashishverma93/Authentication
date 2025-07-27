"use client";

import { useUserContext } from "@/context/userContext";
import Image from "next/image";

export default function Home() {
  const user = useUserContext();
  console.log("User:", user);
  return (
    <main></main>
  );
}
