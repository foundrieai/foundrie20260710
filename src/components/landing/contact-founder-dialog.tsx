'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContactFounderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  userId: string;
  companyName: string;
}

export function ContactFounderDialog({ 
  open, 
  onOpenChange, 
  reportId, 
  userId, 
  companyName 
}: ContactFounderDialogProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleSend = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to contact the founder.",
      });
      router.push('/login');
      return;
    }

    if (!message.trim()) return;

    setIsSending(true);
    try {
      const messagesRef = collection(firestore, 'users', userId, 'reports', reportId, 'messages');
      await addDoc(messagesRef, {
        role: 'user',
        content: `[PARTNER INQUIRY from ${user.displayName || user.email}]\n\n${message}`,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Message Sent!",
        description: `Your inquiry has been sent to the founder of ${companyName}.`,
      });
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Could not send message. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline">Contact {companyName}</DialogTitle>
          <DialogDescription>
            Send a direct message to the founder of this venture. They will see your message in their analyst dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder="I'm interested in learning more about your venture..."
            className="min-h-[120px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>Cancel</Button>
          <Button onClick={handleSend} disabled={isSending || !message.trim()} className="shadow-button-primary">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Inquiry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}