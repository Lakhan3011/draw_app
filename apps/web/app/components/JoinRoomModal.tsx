"use client"
import { Button } from "@repo/ui/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { toast } from "@repo/ui/components/ui/sonner"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"



export function JoinRoomModal() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const router = useRouter();
    let destRoute = "";

    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                destRoute = text;
            }
            toast.success("Pasted from clipboard");
        } catch (error) {
            toast.error("cannot read from clipboard");
        }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="canvas" size="lg" className="group">
                    <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Join a Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Paste drawing link</DialogTitle>
                    <DialogDescription>
                        Paste a room link, slug, or ID (example: <span className="italic">room-slug</span> or
                        https://yourapp.com/room/123?token=abc).
                    </DialogDescription>
                </DialogHeader>
                <form action="">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Paste room link / room slug / room id"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 text-black"
                        />
                        <Button type="button" variant="outline" onClick={pasteFromClipboard}>
                            Paste
                        </Button>
                    </div>

                    <div className="mt-2">
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => router.push(destRoute)} type="submit">Join Room</Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
