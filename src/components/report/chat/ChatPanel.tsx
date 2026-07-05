'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, Paperclip, X, FileIcon, Mic, Trash2, Keyboard, Sparkles, RefreshCcw } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { askChatbot } from '@/ai/flows/report-chat';
import { Report, SectionKey, ChatMessage as ChatMessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, writeBatch, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useVoiceAnalyst } from '@/hooks/use-voice-analyst';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  onRevision: (newDescription?: string, sectionsToUpdate?: SectionKey[], newCompanyName?: string, newTagline?: string) => void;
}

export function ChatPanel({ open, onOpenChange, report, onRevision }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ file: File; dataUri: string } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const messagesCollectionPath = useMemo(() => {
    return `users/${report.userId}/reports/${report.id}/messages`;
  }, [report.userId, report.id]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !report.userId || !report.id) return null;
    return query(
      collection(firestore, messagesCollectionPath),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user, report.userId, report.id, messagesCollectionPath]);

  const { data: dbMessages, isLoading: isMessagesLoading } = useCollection<ChatMessageType>(messagesQuery);

  const messages = dbMessages?.length ? dbMessages : [
    { 
      role: 'model' as const, 
      content: "Hello! I'm IDEAMAIT, your startup validation analyst. I can answer questions about your report, consider your documents, or perform real-time market research. How can I help today?",
      createdAt: new Date().toISOString()
    }
  ];

  const handleSend = async (messageOverride?: string, retryWithTrimming = false) => {
    const currentInput = messageOverride || input;
    const currentFile = attachedFile;
    if ((currentInput.trim() === '' && !currentFile && !retryWithTrimming) || isAiThinking || !firestore) return;

    const userMessageContent = currentInput + (currentFile ? `\n\n[Attached File: ${currentFile.file.name}]` : '');

    if (!retryWithTrimming) {
      setInput('');
      setAttachedFile(null);
    }
    
    setIsAiThinking(true);

    try {
      if (!retryWithTrimming) {
        const messagesCollection = collection(firestore, messagesCollectionPath);
        await addDoc(messagesCollection, {
          role: 'user',
          content: userMessageContent,
          createdAt: new Date().toISOString()
        });
      }

      const reportSummary = {
        companyName: report.companyName,
        industry: report.industry,
        description: report.description,
        scores: report.scores,
        content: report.content 
      };
      
      const rawHistory = (dbMessages || []).slice(retryWithTrimming ? -4 : -8);
      const historyToPass = rawHistory.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      const result = await askChatbot({
        reportContext: JSON.stringify(reportSummary),
        history: historyToPass,
        newMessage: currentInput || "Please continue.",
        attachedFile: currentFile ? {
          dataUri: currentFile.dataUri,
          mimeType: currentFile.file.type,
          name: currentFile.file.name,
        } : undefined,
      });

      const messagesCollection = collection(firestore, messagesCollectionPath);
      await addDoc(messagesCollection, {
        role: 'model',
        content: result.response,
        createdAt: new Date().toISOString()
      });

      if (isVoiceActive) {
        speak(result.response);
      }

      if (result.revision) {
        onRevision(
          result.revision.newDescription, 
          result.revision.sectionsToUpdate,
          result.revision.newCompanyName,
          result.revision.newTagline
        );
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("[ChatPanel] Error sending message:", error);
      
      if (!retryWithTrimming && (error.message?.includes("400") || error.message?.includes("429") || error.message?.includes("limit"))) {
        console.warn("[ChatPanel] Token or payload limit hit. Retrying with compressed history...");
        await handleSend(currentInput, true);
        return;
      }

      toast({
        variant: 'destructive',
        title: "Strategy Uplink Interrupted",
        description: "A sequence or payload error occurred. Please clear history to reset the uplink.",
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  const { state: voiceState, speak, stopEverything: stopVoiceEngine } = useVoiceAnalyst({
    enabled: isVoiceActive,
    onSendMessage: (text) => handleSend(text),
  });

  const handleAbort = () => {
    stopVoiceEngine();
    setIsAiThinking(false);
    setIsVoiceActive(false);
    toast({ title: "Session Interrupted", description: "Voice engine and AI processing terminated." });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages, isAiThinking]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          file,
          dataUri: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearHistory = async () => {
    if (!firestore || !user) return;
    setIsClearing(true);
    try {
      const messagesRef = collection(firestore, messagesCollectionPath);
      const snapshot = await getDocs(messagesRef);
      const batch = writeBatch(firestore);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      toast({ title: "Strategic Uplink Reset", description: "History has been cleared." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Could not clear chat history." });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col border-l border-white/10 bg-black/5 backdrop-blur-2xl" side="right">
        {isVoiceActive && (
          <div className="absolute inset-0 z-[60] bg-gray-950/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff7a00] shadow-[0_0_12px_rgba(255,122,0,0.75)]" />
                <span className="text-[#ffc400] text-xs font-bold tracking-widest uppercase">IDEAMAIT ANALYST</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[#ffc400] text-[10px] font-bold border border-[#ff7a00]/50 rounded-full px-3 py-1 flex items-center gap-1.5 uppercase tracking-tighter">
                  <span className="animate-pulse">((o))</span> VOICE ACTIVE
                </div>
                <button onClick={handleAbort} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 h-16">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 bg-[#ff7a00] rounded-full transition-all duration-300",
                      (voiceState === 'listening' || voiceState === 'speaking') && "animate-voice-waveform"
                    )}
                    style={{ 
                      height: `${h * 100}%`,
                      animationDelay: `${i * 0.1}s` 
                    }}
                  />
                ))}
              </div>
              <h2 className="text-white font-medium text-lg mt-8">
                {voiceState === 'speaking' ? "Speaking..." : voiceState === 'processing' ? "Analyzing..." : "I'm listening..."}
              </h2>
              <p className="text-[#ffc400] text-xs font-bold tracking-widest uppercase mt-2">HANDS-FREE INTERFACE READY</p>
            </div>

            <div className="p-12 flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsVoiceActive(false)}
                className="bg-white w-32 h-10 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
                title="Return to Keyboard"
              >
                <Keyboard className="h-5 w-5 text-black" />
              </button>
              <button 
                onClick={handleAbort}
                className="bg-[#ff3000] hover:bg-[#ff0055] text-white font-medium px-8 py-2 rounded-full transition-colors shadow-lg uppercase text-xs tracking-widest"
              >
                Abort Request
              </button>
            </div>
          </div>
        )}

        <SheetHeader className="p-6 border-b border-white/10 flex flex-col gap-4 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-primary/80 uppercase">
                <div className="relative flex h-2 w-2">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
                  <div className="relative rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(255,122,0,0.6)]" />
                </div>
                <span>IDEAMAIT ANALYST // SECURE EXECUTIVE UPLINK ACTIVE</span>
              </div>
              <SheetTitle className="text-2xl font-bold font-headline tracking-tight text-white">IDEAMAIT</SheetTitle>
            </div>
            <div className="flex items-center gap-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" title="Reset Strategic Uplink" disabled={isClearing || isMessagesLoading}>
                    {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card">
                  <SheetHeader>
                    <SheetTitle>Reset Strategic Uplink?</SheetTitle>
                    <SheetDescription>
                      This will permanently clear the current conversation history. Recommended if you encounter persistent strategy sync errors.
                    </SheetDescription>
                  </SheetHeader>
                  <AlertDialogFooter className="mt-4">
                    <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Clear History
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-6 space-y-4">
              {isMessagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg, index) => (
                  <ChatMessage key={(msg as any).id || index} message={msg} />
                ))
              )}
              {isAiThinking && (
                <div className="flex items-start gap-4">
                    <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full flex-shrink-0 shadow-glow">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div className="max-w-md rounded-lg p-3 bg-secondary/50 backdrop-blur-sm flex items-center border border-white/5">
                        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2"/>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">IDEAMAIT is formulating...</span>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <SheetFooter className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl flex-col gap-3">
          {attachedFile && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md mb-1 animate-in slide-in-from-bottom-2">
              <FileIcon className="h-4 w-4 text-primary" />
              <span className="text-xs truncate flex-grow font-medium">{attachedFile.file.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachedFile(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex w-full items-center gap-2">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-1">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/*,text/plain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:text-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAiThinking}
                title="Attach Document"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (typeof window !== 'undefined' && !((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) {
                    toast({ variant: 'destructive', title: "Browser Unsupported", description: "Voice Mode requires Chrome or Edge." });
                    return;
                  }
                  setIsVoiceActive(true);
                }}
                className={cn("h-9 w-9 transition-all", isVoiceActive && "text-primary shadow-glow")}
                disabled={isAiThinking}
                title="Voice Mode"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              placeholder="Discuss strategy with IDEAMAIT..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isAiThinking}
              className="flex-grow bg-white/5 border-white/10 focus:border-primary/50 transition-all h-11"
            />
            
            <Button 
              onClick={() => handleSend()} 
              disabled={isAiThinking || (input.trim() === '' && !attachedFile)} 
              size="icon" 
              className="h-11 w-11 shadow-button-primary shrink-0"
            >
              <span className="sr-only">Send</span>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}