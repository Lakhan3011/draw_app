import { Button } from "@repo/ui/components/ui/button";
import { Sparkles } from "lucide-react";

export const CTA = () => {
    return (
        <section className="py-24 px-4 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-sky-800/5 relative overflow-hidden">
            {/* Decorative grid overlay */}
            <div className="absolute inset-0 canvas-grid opacity-30" />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-1/4 w-32 h-32 border-4 border-chart-2/20 rounded-full animate-float" />
                <div className="absolute bottom-20 right-1/4 w-24 h-24 border-4 border-chart-1/20 rounded-lg animate-float-delayed" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-3xl p-12 md:p-16 text-center shadow-[var(--shadow-medium)]">
                    <div className="inline-flex items-center gap-2  bg-blue-600/10 text-blue-700  px-4 py-2 rounded-full mb-6 border border-blue-600/20">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Free Forever</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Draw
                        <span className="text-gradient"> Together?</span>
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of teams using DrawApp to collaborate visually.
                        Create your first canvas in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button variant="hero" size="lg" className="group">
                            Launch DrawApp
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                        <Button variant="outline" size="lg" className="hover:bg-amber-500 transition-transform">
                            View Demo
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-8">
                        No installation required • Works in any browser
                    </p>
                </div>
            </div>
        </section>
    );
};
