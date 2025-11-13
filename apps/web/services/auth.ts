import { BACKEND_URL } from "@/config";
import axios from "axios";

interface User {
    name?: string;
    email: string;
    password: string
}

export async function SignUpUser(user: User) {
    const res = await axios.post(`${BACKEND_URL}/signup`, user);
    return res.data;
}

export async function SignInUser(user: User) {
    const res = await axios.post(`${BACKEND_URL}/signin`, user);
    return res.data;
}

