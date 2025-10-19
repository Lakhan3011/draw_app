"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="bg-black flex flex-col gap-4 items-center justify-center w-screen h-screen">
      <input
        className="bg-white text-black outline-none p-2"
        onChange={(e) => setRoomId(e.target.value)}
        type="text"
        placeholder="Room Id"
      />
      <button
        className="bg-purple-600 rounded-xl p-4 cursor-pointer"
        onClick={() => router.push(`/room/${roomId}`)}
      >
        Join Room</button>
    </div>
  );
}
