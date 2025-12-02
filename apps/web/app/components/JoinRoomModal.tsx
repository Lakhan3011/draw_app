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
import React, { useState } from "react"

function parseInputToRoute(raw: string) {
    raw = raw.trim();
    if (!raw) throw new Error("Empty Input");

    try {
        const url = new URL(raw);
        const parts = url.pathname.split('/').filter(Boolean);
        const last = parts.length ? parts[parts.length - 1] : null;
        const invite = url.searchParams.get('invite');
        if (!last) throw new Error("Invalid Room URL");
        return {
            path: `/room/${encodeURIComponent(last)}`,
            invite: invite ? encodeURIComponent(invite) : undefined
        };
    } catch (error) {
        const [left, qs] = raw.split("?");
        const possible = left?.trim();
        if (!possible) throw new Error("Invalid Input");
        let invite: string | undefined;
        if (qs) {
            const params = new URLSearchParams(qs);
            invite = params.get('invite') ?? undefined;
        }
        return {
            path: `/room/${encodeURIComponent(possible)}`,
            invite: invite ? encodeURIComponent(invite) : undefined
        }
    }
}


export function JoinRoomModal() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const router = useRouter();

    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setInput(text);
                toast.success("Pasted from clipboard");
            } else {
                toast.error("Clipboard is empty");
            }
        } catch (error) {
            toast.error("cannot read from clipboard");
        }
    };

    const handleJoin = (e?: React.FormEvent) => {
        e?.preventDefault();
        try {
            const { path, invite } = parseInputToRoute(input);
            const dest = invite ? `${path}?invite=${invite}` : path;
            setOpen(false);
            router.push(dest);
        } catch (err: any) {
            toast.error(err?.message ?? "Invalid room link/slug/id");
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
                <form onSubmit={handleJoin} className="space-y-4">
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

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleJoin} disabled={!input.trim()}>Join Room</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
};
