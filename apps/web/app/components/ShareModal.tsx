"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShareRoom } from "@/services/room";
import { toast } from "@repo/ui/components/ui/sonner";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogContent,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Copy, Loader2, Share2 } from "lucide-react";

interface ShareModalProps {
    roomId: string;
}

export function ShareModal({ roomId }: ShareModalProps) {
    const [viewUrl, setViewUrl] = useState("");
    const [editUrl, setEditUrl] = useState("");

    const shareMutation = useMutation({
        mutationFn: () => ShareRoom(roomId),
        onSuccess: (data) => {
            setViewUrl(data.viewOnlyUrl);
            setEditUrl(data.editUrl);

            toast.success("Share links generated!", {
                description: "You can now share view or edit links",
            });
        },
        onError: () => {
            toast.error("Failed to generate links", {
                description: "Please try again",
            });
        },
    });

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!", { description: text });
    };

    return (
        <Dialog>
            {/* TRIGGER BUTTON */}
            <DialogTrigger asChild>
                <Button variant="canvas" className="gap-2">
                    <Share2 className="w-5 h-5" />
                    Share
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[450px] space-y-6">
                <DialogHeader>
                    <DialogTitle>Share Room</DialogTitle>
                    <DialogDescription>
                        Generate a link to collaborate live in this canvas.
                    </DialogDescription>
                </DialogHeader>

                {/* Generate button */}
                <Button
                    onClick={() => shareMutation.mutate()}
                    className="w-full gap-2"
                    disabled={shareMutation.isPending}
                >
                    {shareMutation.isPending ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" /> Generating...
                        </>
                    ) : (
                        "Generate Share Links"
                    )}
                </Button>

                {/* VIEW ONLY */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">View-only Link</label>
                    <div className="flex gap-2">
                        <Input readOnly value={viewUrl} className="flex-1 text-black" />
                        <Button
                            variant="outline"
                            disabled={!viewUrl}
                            onClick={() => copy(viewUrl)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* EDIT LINK */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Edit Link</label>
                    <div className="flex gap-2">
                        <Input readOnly value={editUrl} className="flex-1 text-black" />
                        <Button
                            variant="outline"
                            disabled={!editUrl}
                            onClick={() => copy(editUrl)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
