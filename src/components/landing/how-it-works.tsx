import { FileText, Bot, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: "Describe Your Idea",
    description: "Fill out a simple form with your startup concept, target market, and current stage.",
  },
  {
    number: "02",
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: "AI Analyzes",
    description: "Our AI, trained on top VC methodologies, performs a deep analysis of your idea against market data.",
  },
  {
    number: "03",
    icon: <FileCheck className="h-10 w-10 text-primary" />,
    title: "Get Your Report",
    description: "Receive a comprehensive, evidence-informed validation report in minutes, ready to share.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-white">How It Works</h2>
          <p className="text-muted-foreground md:text-lg">
            Transform your vision into a validated plan in three simple steps.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-border hidden md:block" />
          {steps.map((step, index) => (
            <Card key={index} className="glass-card p-8 text-center flex flex-col items-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary px-2 font-code text-2xl text-primary font-bold">{step.number}</div>
              <div className="mb-6 mt-4">{step.icon}</div>
              <h3 className="text-2xl font-headline font-bold capitalize text-white mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
