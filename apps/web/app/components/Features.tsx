import { Pencil, Users, Shapes, MousePointer2, Palette, Zap } from "lucide-react";

const features = [
    {
        icon: Pencil,
        title: "Freehand Drawing",
        description: "Sketch ideas naturally with smooth, responsive drawing tools that feel like pen on paper.",
        color: 'blue-600',
    },
    {
        icon: Shapes,
        title: "Shape Library",
        description: "Access rectangles, circles, arrows, and more. Create diagrams and wireframes in seconds.",
        color: `red-500`,
    },
    {
        icon: Users,
        title: "Real-time Collaboration",
        description: "See everyone's cursors and edits live. Multiple users can draw simultaneously without lag.",
        color: `green-500`,
    },
    {
        icon: MousePointer2,
        title: "Live Cursors",
        description: "Track your teammates with color-coded cursors. Know exactly who's working on what.",
        color: "blue-600",
    },
    {
        icon: Palette,
        title: "Infinite Canvas",
        description: "Never run out of space. Pan and zoom freely across an unlimited drawing surface.",
        color: "chart-1",
    },
    {
        icon: Zap,
        title: "Instant Sync",
        description: "WebSocket-powered updates ensure every stroke appears instantly for all participants.",
        color: "chart-2",
    },
];

export const Features = () => {
    return (
        <section className="py-24 px-4 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Everything You Need to
                        <span className="text-gradient"> Collaborate</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Built for teams who think visually. Draw, design, and brainstorm together in real-time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative  bg-card border border-border rounded-2xl p-8 hover:shadow-[var(--shadow-medium)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`inline-flex p-3 rounded-xl bg-${feature.color}/10  text-${feature.color} mb-4  group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`w-6 h-6 `} />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
