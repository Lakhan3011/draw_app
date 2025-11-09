import { useNavigate } from "react-router-dom";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Pencil, Users, Clock, Plus } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { Navbar } from "../components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { GetExistingRooms } from "@/services/room";

interface Room {
    id: string,
    slug: string,
    isActive: boolean,
    participants: number,
    maxParticipants: number,
    createdAt: string
}

// Mock data - will be replaced with real data from Lovable Cloud
const mockRooms = [
    {
        id: "1",
        name: "Design Brainstorm",
        participants: 3,
        maxParticipants: 8,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isActive: true,
    },
    {
        id: "2",
        name: "Team Drawing Session",
        participants: 5,
        maxParticipants: 10,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isActive: true,
    },
    {
        id: "3",
        name: "Quick Sketch",
        participants: 1,
        maxParticipants: 4,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        isActive: false,
    },
];

export default function Rooms() {
    const navigate = useNavigate();
    // const [rooms] = useState(mockRooms);

    const { data: rooms, isLoading, error } = useQuery({
        queryKey: ["rooms"],
        queryFn: GetExistingRooms
    });

    if (isLoading) {
        return (
            <p>Loading rooms....</p>
        )
    }

    if (error) {
        return (
            <p>
                Error in fetching rooms...
            </p>
        )
    }


    const handleJoinRoom = (roomId: string) => {
        toast.success("Backend Required", {
            description: "Enable Lovable Cloud to join rooms and collaborate in real-time."
        });
    };

    const handleCreateRoom = () => {
        toast.success("Backend Required", {
            description: "Enable Lovable Cloud to create new rooms."
        });
    };

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return "Just now";
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Rooms</h1>
                            <p className="text-muted-foreground">Join a room to start collaborating</p>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleCreateRoom}
                            className="gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Room
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room: Room) => (
                            <Card key={room.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl">{room.slug}</CardTitle>
                                        <Badge variant={room.isActive ? "default" : "secondary"}>
                                            {room.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {room.participants}/{room.maxParticipants}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {getTimeAgo(room.createdAt)}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleJoinRoom(room.id)}
                                        disabled={room.participants >= room.maxParticipants}
                                    >
                                        {room.participants >= room.maxParticipants ? "Room Full" : "Join Room"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {rooms.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg mb-4">No rooms yet</p>
                            <Button onClick={handleCreateRoom}>Create Your First Room</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
