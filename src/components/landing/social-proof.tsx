
'use client';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const SocialProof = () => {
  const logos = PlaceHolderImages.filter(p => p.imageHint.includes('logo'));

  return (
    <section className="container py-12 border-y border-border/40">
      <div className="flex flex-col items-center gap-8">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Trusted by founders building the next unicorn
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10">
          {logos.map((logo) => (
            <div key={logo.id} className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
              <Image
                src={logo.imageUrl}
                alt={logo.description}
                width={120}
                height={48}
                className="h-8 w-auto object-contain"
                data-ai-hint={logo.imageHint}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
