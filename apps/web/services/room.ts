import { BACKEND_URL } from "@/config"
import axios from "axios"
import { Backpack } from "lucide-react";


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

export async function GetExistingRooms() {
    const res = await axios.get(`${BACKEND_URL}/existing-rooms`, {
        headers: {
            Authorization: localStorage.getItem("token"),
        }
    });

    if (res) {
        const rooms = res.data.rooms;
        return rooms;
    }

}

export async function DeleteRoom(roomId: string) {
    const res = await axios.delete(`${BACKEND_URL}/delete-room/${roomId}`, {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    });

    return res.data;
}

export async function ShareRoom(roomId: string) {
    const res = await axios.post(`${BACKEND_URL}/rooms/${roomId}/share`, {}, {
        headers: {
            Authorization: localStorage.getItem("token"),
        }
    });
    return res.data;
}
