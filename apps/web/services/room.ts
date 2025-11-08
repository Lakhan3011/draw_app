import { BACKEND_URL } from "@/config"
import axios from "axios"


export async function CreateNewRoom(roomName: {
    name: string
}) {
    const res = await axios.post(`${BACKEND_URL}/room`, roomName, {
        headers: {
            Authorization: localStorage.getItem("token"),
        }
    });
    return res.data;
}