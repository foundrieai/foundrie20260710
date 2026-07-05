'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Twitter, Linkedin, Mail } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
}

export function ShareDialog({ open, onOpenChange, reportTitle }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Private report link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out this startup validation report for ${reportTitle} on LAUNCHCODE!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Startup Validation Report: ${reportTitle}`;
    const body = `Hi,\n\nI'm sharing this startup validation report for ${reportTitle} with you. You can view it here: ${shareUrl}\n\nBest regards.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline">Share Report</DialogTitle>
          <DialogDescription>
            Share this evidence-informed validation with co-founders or third parties.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Input id="link" defaultValue={shareUrl} readOnly className="bg-black/20" />
          <Button size="icon" onClick={handleCopy} className="shadow-button-primary">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full justify-start h-12" onClick={shareViaEmail}>
            <Mail className="mr-3 h-5 w-5 text-primary" /> Share via Email
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={shareToTwitter}>
              <Twitter className="mr-2 h-4 w-4" /> X
            </Button>
            <Button variant="outline" className="flex-1 h-12" onClick={shareToLinkedIn}>
              <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
