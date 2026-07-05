'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, Shield, BarChart3, Search, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Instant Validation",
    description: "Go from abstract idea to a concrete 14-section validation report in less than 3 minutes.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Investor-Grade Scoring",
    description: "Objective scoring on market potential, technical feasibility, and financial viability.",
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "Deep-Dive Research",
    description: "Granular AI-powered research on any section, uncovering data your competitors missed.",
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "VC Frameworks",
    description: "Reports built on structured startup assessment practices, ready for your first founder-readiness discussion.",
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-primary" />,
    title: "Market Intelligence",
    description: "Real-time access to the latest market signals, regulatory shifts, and consumer trends.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Collaboration Ready",
    description: "Export to PDF or Word, or share private links with co-founders and early advisors.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="container py-24 scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-white">Sophisticated Tools For Modern Founders</h2>
        <p className="text-lg text-muted-foreground">
          LAUNCHCODE gives you the analytical firepower of a venture capital associate at your fingertips.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="glass-card hover:border-primary/50 transition-colors group">
            <CardHeader>
              <div className="mb-4 bg-primary/10 w-fit p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <CardTitle className="text-2xl font-headline font-bold capitalize text-white">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
