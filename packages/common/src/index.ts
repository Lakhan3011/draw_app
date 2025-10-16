import { z } from 'zod'

export const signUpSchema = z.object({
    email: z.email(),
    password: z.string().min(6).max(20),
    name: z.string().min(6).max(20)
})

export const signInSchema = z.object({
    email: z.email(),
    password: z.string()
})

export const createRoomSchema = z.object({
    name: z.string().min(3).max(10),
})