import { cn } from "@/lib/utils";

export const GlowContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5 bg-primary/10 rounded-full blur-[60px] pointer-events-none -z-10" />
      {children}
    </div>
  );
};
