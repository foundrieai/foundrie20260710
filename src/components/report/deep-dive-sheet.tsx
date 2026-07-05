'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DeepDiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: string;
  isLoading: boolean;
  content: string | null;
}

const LoadingState = ({ section }: { section: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-bold font-headline">Conducting deeper research...</h3>
        <p className="text-muted-foreground">Analyzing "{section}" for more granular insights.</p>
    </div>
);


export function DeepDiveSheet({ open, onOpenChange, section, isLoading, content }: DeepDiveSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl p-0 flex flex-col" side="right">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold font-headline">Deep Dive: {section}</SheetTitle>
          <SheetDescription>
            Additional AI-powered analysis for a more granular understanding.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
                {isLoading && <LoadingState section={section} />}
                {content && (
                    <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="p-4 border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
