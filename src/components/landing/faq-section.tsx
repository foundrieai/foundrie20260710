
'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How accurate is the AI validation?",
    a: "The AI is trained on thousands of successful (and failed) startup patterns and uses standard VC frameworks. While it can't predict the future, it provides a high-fidelity objective analysis of your fundamentals."
  },
  {
    q: "Is my idea kept private?",
    a: "Yes. Your data is encrypted and stored securely. We do not use your proprietary startup ideas to train global models. Your data belongs to you."
  },
  {
    q: "Can I share my report with investors?",
    a: "Absolutely. LAUNCHCODE reports are designed to be investor-ready. You can export them to PDF or share a direct, private link."
  },
  {
    q: "What industries do you support?",
    a: "We support everything from SaaS and FinTech to hard-tech and consumer marketplaces. Our models adjust their reasoning based on the specific industry norms."
  }
];

export const FaqSection = () => {
  return (
    <section id="faqs" className="container py-24 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold font-headline text-center mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass-card border-none rounded-lg mb-4 px-6">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
