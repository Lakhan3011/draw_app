import { BACKEND_URL } from "@/config"
import axios from "axios"
import { useMemo } from "react";


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

export const myColor = () => {
    const cursorColor = useMemo(
        () => `hsl (${Math.random() * 360}, 70%, 60%)`,
        []
    );
    return cursorColor;
}