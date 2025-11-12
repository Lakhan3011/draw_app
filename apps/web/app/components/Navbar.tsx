import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import { LogOutIcon, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";


export const Navbar = ({ auth }: {
    auth: boolean
}) => {
    const router = useRouter();

    const handleLogout = () => {
        toast.success("Successfully logout", {
            description: "See you later",
            position: "top-center",
            style: {
                background: "green",
                color: "white"
            }
        })
        localStorage.removeItem("token")
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-purple-700 rounded-lg flex items-center justify-center">
                            <Pencil className="w-6 h-6 text-primary-foreground cursor-pointer"
                                onClick={() => (router.push('/'))}
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 text-transparent bg-clip-text ">DrawApp</span>
                    </div>

                    {auth ? (<div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/existing-rooms')}
                        >
                            My Rooms
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/auth')}
                            className="hover:bg-sky-300"
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="hero"
                            onClick={() => router.push('/auth?mode=signup')}
                        >
                            Sign Up Free
                        </Button>
                    </div>) : (
                        (<div className="flex items-center gap-3">

                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="cursor-pointer"
                            >
                                <LogOutIcon className="w-5 h-5" />
                                Log Out
                            </Button>
                        </div>)
                    )
                    }
                </div>
            </div>
        </nav>
    );
};
