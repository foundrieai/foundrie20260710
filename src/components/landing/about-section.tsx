'use client';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "../ui/button";
import Link from "next/link";

export const AboutSection = () => {
  const storyImg = PlaceHolderImages.find(img => img.id === 'founder-story');

  return (
    <section className="container py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <Image
            src={storyImg?.imageUrl || ''}
            alt={storyImg?.description || "The Founder Story"}
            width={800}
            height={600}
            className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-500"
            data-ai-hint={storyImg?.imageHint}
          />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold font-headline mb-6 uppercase tracking-tight">Our Mission</h2>
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            LAUNCHCODE was born in the trenches of the startup world. We saw too many brilliant innovations fail not because of the tech, but because of poor validation.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Our goal is simple: democratize access to elite venture strategy. We give every founder the tools to build "the right way" from day zero.
          </p>
          <Button variant="outline" asChild>
            <Link href="/signup">Join the Movement</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
