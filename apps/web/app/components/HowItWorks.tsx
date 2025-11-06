import { ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Create a Room",
        description: "Generate a unique room link instantly. No sign-up, no hassle.",
    },
    {
        number: "02",
        title: "Share the Link",
        description: "Invite teammates by sharing your room URL. They join in one click.",
    },
    {
        number: "03",
        title: "Start Drawing",
        description: "Collaborate in real-time. See everyone's changes instantly.",
    },
];

export const HowItWorks = () => {
    return (
        <section className="py-24 px-4 bg-muted/30 canvas-grid relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-32 h-32 border-4 border-destructive/20 rounded-full animate-float" />
            <div className="absolute bottom-20 left-10 w-24 h-24 border-4 border-blue-600/20 rounded-lg animate-float-delayed" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Get Started in
                        <span className="text-gradient"> Seconds</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        No complex setup. No learning curve. Just pure collaboration.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector arrow */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/4 -right-4 z-20">
                                    <ArrowRight className="w-8 h-8 text-blue-700/40" />
                                </div>
                            )}

                            <div className="bg-card border-2 border-border rounded-2xl p-8 hover:border-blue-600/50 transition-all duration-300 hover:shadow-[var(--shadow-medium)] h-full">
                                <div className="text-6xl font-bold text-gradient mb-6 opacity-50">
                                    {step.number}
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
