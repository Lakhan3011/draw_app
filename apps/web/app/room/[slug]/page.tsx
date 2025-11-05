import axios from "axios";
import { BACKEND_URL } from "../../config/config";
import ChatRoom from "../../components/ChatRoom";

async function getRoomId(slug: string) {
    const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
    return res.data.roomId;
}


export default async function Room({ params }: {
    params: { slug: string }
}) {
    const slug = params.slug;
    const roomId = await getRoomId(slug);
    console.log('roomId is:', roomId);

    return (
        <div className="bg-black w-screen h-screen flex flex-col justify-between text-white">
            <ChatRoom id={roomId} />
        </div>
    )
}