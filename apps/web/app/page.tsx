"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Navbar } from "./components/Navbar";

// TODO: use react form
export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="bg-black flex flex-col gap-4 items-center justify-center w-screen h-screen">
      <Navbar />
      <input
        className="bg-white text-black outline-none p-2"
        onChange={(e) => setRoomId(e.target.value)}
        type="text"
        placeholder="Room Id"
      />
      <Button
        className="bg-purple-600 rounded-xl p-4 cursor-pointer"
        onClick={() => router.push(`/room/${roomId}`)}
        variant={"secondary"}
      >
        Join Room</Button>
    </div>
  );
}
