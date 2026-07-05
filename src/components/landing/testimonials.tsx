'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const testimonials = [
  {
    quote: "LAUNCHCODE saved us months of market research. The report was so thorough that our lead investor asked who our consultant was.",
    author: "Sarah Jenkins",
    role: "Founder, Bloom Health",
    avatar: PlaceHolderImages.find(img => img.id === 'testimonial-1')?.imageUrl
  },
  {
    quote: "As a VC, I recommend LAUNCHCODE to every founder in my network. It forces them to think through the hard questions early.",
    author: "David Chen",
    role: "Partner, North Star Ventures",
    avatar: PlaceHolderImages.find(img => img.id === 'testimonial-2')?.imageUrl
  },
  {
    quote: "The deep-dive research capability is game-changing. It found competitive signals that we had completely overlooked.",
    author: "Marcus Thorne",
    role: "CTO, Nexus Dynamics",
    avatar: "https://picsum.photos/seed/user3/100/100"
  }
];

export const Testimonials = () => {
  return (
    <section className="bg-secondary/30 py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-headline mb-4">Founder Favorites</h2>
          <p className="text-muted-foreground">Join 10,000+ founders building the future with LAUNCHCODE.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="glass-card flex flex-col justify-between">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
                </div>
                <p className="text-lg text-foreground mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={t.avatar} data-ai-hint="person" />
                    <AvatarFallback>{t.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
