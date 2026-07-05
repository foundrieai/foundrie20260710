'use client';
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const Benefits = () => {
  const illustration = PlaceHolderImages.find(img => img.id === 'benefits-illustration');
  
  const benefits = [
    { title: "Efficiency First", desc: "No more endless spreadsheets. Validate in minutes, not weeks." },
    { title: "Investor-Grade", desc: "Speak the language of VCs with built-in financial and market frameworks." },
    { title: "Data-Backed", desc: "Real-time internet access ensures your analysis is based on today's market." },
  ];

  return (
    <section className="container py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold font-headline mb-8">Why Thousands Choose LAUNCHCODE</h2>
          <div className="space-y-8">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                  <p className="text-muted-foreground text-lg">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <Image
            src={illustration?.imageUrl || ''}
            alt={illustration?.description || "Growth Illustration"}
            width={800}
            height={600}
            className="relative rounded-2xl shadow-2xl border border-white/10"
            data-ai-hint={illustration?.imageHint}
          />
        </div>
      </div>
    </section>
  );
};
