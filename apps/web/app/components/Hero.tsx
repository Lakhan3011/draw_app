import { Button } from "@repo/ui/components/ui/button";
import { Pencil, Users, Zap } from "lucide-react";
import heroImage from "@/public/hero-collaboration.jpg";
import Image from "next/image";

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas-bg canvas-grid">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-[var(--gradient-hero)] pointer-events-none" />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-24 h-24 border-4 border-blue-700/40 rounded-lg animate-float" />
                <div className="absolute top-40 right-20 w-32 h-32 border-4 border-purple-400/50 rounded-full animate-float-delayed" />
                <div className="absolute bottom-32 left-1/4 w-20 h-20 border-4 border-purple-700/30 animate-float"
                    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                <div className="absolute top-1/3 right-1/3 w-16 h-16 border-4 border-blue-800/50 rounded animate-float-delayed" />
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 px-4 py-2 rounded-full mb-6 border border-primary/20">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-medium">Real-time Collaboration</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                            Draw Together,
                            <br />
                            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">Create Together</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                            A powerful collaborative whiteboard where teams sketch ideas, design workflows,
                            and brainstorm in real-time. No setup required.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button variant="hero" size="lg" className="group">
                                <Pencil className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Start Drawing Now
                            </Button>
                            <Button variant="canvas" size="lg" className="group">
                                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Join a Room
                            </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mt-6">
                            No credit card required • Free unlimited rooms
                        </p>
                    </div>

                    {/* Hero image */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                        <div className="relative rounded-2xl overflow-hidden border-4 border-card shadow-[var(--shadow-medium)] bg-card">
                            <Image
                                src={heroImage}
                                alt="Collaborative drawing workspace showing multiple users creating shapes together in real-time"
                                className="w-full h-auto"
                            />
                            {/* Collaboration indicators */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                            <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-border text-sm font-medium">
                                <span className="text-chart-5">3 users</span> drawing
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
                    <div className="w-1.5 h-3 bg-foreground/30 rounded-full" />
                </div>
            </div>
        </section>
    );
};
