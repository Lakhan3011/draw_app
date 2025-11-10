import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function Room({ params }: {
    params: { slug: string }
}) {
    const roomId = (await params).slug;
    console.log('roomId is:', roomId);

    return (
        <div className="bg-black w-screen h-screen flex flex-col justify-between text-white">
            <RoomCanvas roomId={roomId} />
        </div>
    )
}