import axios from "axios";
import { BACKEND_URL } from "../config/config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return res.data.chats;
}

export default async function ChatRoom({ id }: { id: string }) {
    const chats = await getChats(id);
    return (
        <div>
            <ChatRoomClient id={id} messages={chats} />
        </div>
    )
}