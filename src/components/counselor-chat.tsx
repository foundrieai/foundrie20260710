
"use client";

import { useState, createRef, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User, Bot, Loader2, RotateCcw, MessageCircle, X, Mic, MicOff, Volume2, VolumeX, Radio, Paperclip } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { processFile } from "@/lib/file-processor";

type Message = {
    role: 'user' | 'model';
    content: any; 
};

interface CounselorChatProps {
    resumeText: string;
    jobDescription: string;
    onResumeUpdate: (newResume: string) => void;
    chatAction: (input: any) => Promise<any>;
    /** Optional automated first greeting shown as the assistant's opening message. */
    introMessage?: string;
    /**
     * A one-time coach-mark bubble shown above the widget the first time a user
     * enters a given tool, introducing what Ideamait can help with. `key`
     * scopes "seen" per tool; `text` is the message.
     */
    coachMark?: { key: string; text: string };
}

/**
 * @fileOverview IDEAMAIT - Floating executive career counselor widget with Voice Engine and Document Upload.
 * Implements CAPITALIDEAS design system with brand red (#FF0033) accents.
 */
export function CounselorChat({ resumeText, jobDescription, onResumeUpdate, chatAction, introMessage, coachMark }: CounselorChatProps) {
    const { user, isUserLoading } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [showCoach, setShowCoach] = useState(false);

    // First-run coach mark: show it once per (user, tool), a moment after mount,
    // only while the chat is closed. Keyed by uid so it never crosses users.
    const coachSeenKey = coachMark && user?.uid ? `foundrie:ideamait-intro:${user.uid}:${coachMark.key}` : null;
    useEffect(() => {
        if (!coachSeenKey || isOpen) return;
        let seen = false;
        try { seen = window.localStorage.getItem(coachSeenKey) === '1'; } catch {}
        if (seen) return;
        const t = setTimeout(() => setShowCoach(true), 1100);
        return () => clearTimeout(t);
    }, [coachSeenKey, isOpen]);

    const dismissCoach = () => {
        try { if (coachSeenKey) window.localStorage.setItem(coachSeenKey, '1'); } catch {}
        setShowCoach(false);
    };
    const [messages, setMessages] = useState<Message[]>(introMessage ? [{ role: 'model', content: introMessage }] : []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    // Document Upload State
    const [stagedFile, setStagedFile] = useState<File | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice Mode State
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const scrollAreaRef = createRef<HTMLDivElement>();
    const { toast } = useToast();
    
    // Web Speech Refs
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // RBAC: Visible to admin or if public chat is enabled
    const isAdmin = user?.email === 'hello@thesiliconhill.com';
    const isPublicChatEnabled = true; 
    const isVisible = isAdmin || isPublicChatEnabled;

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, scrollAreaRef]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    if (isVoiceMode) {
                        handleVoiceSubmit(transcript);
                    } else {
                        setInput(transcript);
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.onerror = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
            synthRef.current = window.speechSynthesis;
        }
    }, [isVoiceMode]);

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            if (synthRef.current) synthRef.current.cancel();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    if (isUserLoading || !isVisible) return null;

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setIsListening(true);
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.warn("Speech recognition failed to start.");
                setIsListening(false);
            }
        }
    };

    const speak = (text: string) => {
        if (!synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (isVoiceMode) {
                setTimeout(() => toggleListening(), 500);
            }
        };
        synthRef.current.speak(utterance);
    };

    const handleVoiceSubmit = async (transcript: string) => {
        if (!transcript.trim()) return;
        await processMessage(transcript);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !stagedFile) || isLoading || isProcessingFile) return;
        await processMessage(input);
        setInput('');
    };

    const processMessage = async (text: string) => {
        let aiInput = text;
        const displayPrompt = text || (stagedFile ? `Attached: ${stagedFile.name}` : "Document Analysis Request");

        if (stagedFile) {
            setIsProcessingFile(true);
            try {
                const extractionResult = await processFile(stagedFile);
                if (extractionResult.extractionStatus === 'success') {
                    aiInput = `[EXECUTIVE BRIEF: ATTACHED DOCUMENT ANALYSIS]\nFILE NAME: ${stagedFile.name}\nEXTRACTED CONTENT:\n${extractionResult.extractedText}\n\nUSER PROMPT: ${text || "Please analyze this document relative to my career goals."}`;
                } else {
                    toast({ 
                        variant: 'destructive', 
                        title: "Document Error", 
                        description: "Could not read document. Please paste text instead." 
                    });
                    setIsProcessingFile(false);
                    return;
                }
            } catch (err) {
                toast({ variant: 'destructive', title: "System Error", description: "File processing failed." });
                setIsProcessingFile(false);
                return;
            } finally {
                setIsProcessingFile(false);
            }
        }

        const newUserMessage: Message = { role: 'user', content: displayPrompt };
        const newHistory = [...messages, newUserMessage];
        setMessages(newHistory);
        setIsLoading(true);
        setHasError(false);

        try {
            const response = await chatAction({
                resume: resumeText,
                jobDescription,
                history: messages,
                userInput: aiInput,
            });

            if (!response.success || response.error) {
                setHasError(true);
                toast({ 
                    variant: 'destructive', 
                    title: "IDEAMAIT Offline", 
                    description: response.error || 'Connection interrupted.'
                });
            } else if (response.data) {
                const modelMessage: Message = { role: 'model', content: response.data.responseText };
                setMessages(prev => [...prev, modelMessage]);

                if (response.data.updatedResumeText) {
                    onResumeUpdate(response.data.updatedResumeText);
                }

                if (isVoiceMode) {
                    speak(response.data.responseText);
                }
                
                // Clear file after successful send
                setStagedFile(null);
            }
        } catch (error: any) {
            setHasError(true);
            toast({ variant: 'destructive', title: "System Fault", description: error?.message });
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (content: any) => {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            const textPart = content.find(p => p.text);
            return textPart?.text || "IDEAMAIT is processing...";
        }
        return "Unsupported payload";
    };

    const resetHistory = () => {
        setMessages(introMessage ? [{ role: 'model', content: introMessage }] : []);
        setHasError(false);
        setStagedFile(null);
        toast({ title: "Memory Wiped", description: "IDEAMAIT context has been cleared." });
    };

    return (
        <div className="fixed bottom-0 right-0 z-[9999] pointer-events-none">
            <div className="relative pointer-events-auto p-6">
                {/* First-run coach mark, above the widget. Opaque so it is always readable. */}
                {showCoach && coachMark && !isOpen && (
                    <div className="absolute bottom-24 right-6 w-[300px] max-w-[78vw] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative rounded-2xl border border-white/12 bg-[#1a1824] p-4 shadow-2xl">
                            <button
                                type="button"
                                onClick={dismissCoach}
                                aria-label="Dismiss"
                                className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white/80"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-start gap-2.5 pr-5">
                                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/30 text-[#FF3355]">
                                    <Bot className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff7a00]">Meet Ideamait</p>
                                    <p className="mt-1 text-sm leading-6 text-white/85">{coachMark.text}</p>
                                    <button
                                        type="button"
                                        onClick={() => { setIsOpen(true); dismissCoach(); }}
                                        className="mt-2.5 inline-flex items-center gap-1 text-sm font-bold text-[#FF3355] hover:text-[#ff5c78]"
                                    >
                                        Chat with Ideamait <span aria-hidden>&rarr;</span>
                                    </button>
                                </div>
                            </div>
                            {/* Tail pointing down toward the widget button. */}
                            <div className="absolute -bottom-1.5 right-9 h-3 w-3 rotate-45 border-b border-r border-white/12 bg-[#1a1824]" />
                        </div>
                    </div>
                )}
                <Button
                    onClick={() => { if (!isOpen) dismissCoach(); setIsOpen(!isOpen); }}
                    className={cn(
                        "h-14 w-14 rounded-lg shadow-[0_0_25px_rgba(255,0,51,0.4)] transition-all duration-500 transform hover:scale-110 active:scale-95 border-2 border-[#FF0033]/30",
                        isOpen ? "bg-zinc-900 text-[#FF0033] rotate-90" : "bg-[#FF0033] text-white"
                    )}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                </Button>

                <div className={cn(
                    "absolute bottom-24 right-6 w-[90vw] sm:w-[420px] h-[650px] max-h-[80vh] transition-all duration-500 transform origin-bottom-right",
                    isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
                )}>
                    <Card className="h-full flex flex-col border-white/5 shadow-2xl bg-zinc-950/95 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-zinc-900/80 border-b border-white/5 py-5 px-8 flex flex-row items-center justify-between shrink-0">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-[#FF0033]">
                                <div className={cn(
                                    "h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(255,0,51,0.8)]",
                                    (isSpeaking || isLoading || isProcessingFile) ? "bg-green-400 animate-pulse" : "bg-[#FF0033]"
                                )} />
                                IDEAMAIT ANALYST
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                        setIsVoiceMode(!isVoiceMode);
                                        if (!isVoiceMode) {
                                            setTimeout(() => toggleListening(), 300);
                                        } else {
                                            synthRef.current?.cancel();
                                            recognitionRef.current?.stop();
                                            setIsListening(false);
                                            setIsSpeaking(false);
                                        }
                                    }}
                                    className={cn(
                                        "h-8 px-3 text-[9px] font-black uppercase tracking-widest border border-white/5 rounded-xl transition-all",
                                        isVoiceMode ? "bg-[#FF0033]/20 text-[#FF0033] border-[#FF0033]/30" : "text-zinc-500 hover:text-[#FF0033]"
                                    )}
                                >
                                    <Radio className={cn("h-3 w-3 mr-2", isVoiceMode && "animate-pulse")} />
                                    {isVoiceMode ? "VOICE ACTIVE" : "VOICE MODE"}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                            <div className={cn(
                                "absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center transition-all duration-500 p-8 text-center",
                                isVoiceMode ? "opacity-100" : "opacity-0 pointer-events-none"
                            )}>
                                <div className="flex items-end justify-center gap-1.5 h-32 mb-12">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <div 
                                            key={i}
                                            className={cn(
                                                "w-2 bg-[#FF0033] rounded-full transition-all duration-300",
                                                (isSpeaking || isListening) ? "animate-bounce" : "h-2 bg-zinc-800"
                                            )}
                                            style={{ 
                                                animationDelay: `${i * 0.08}s`,
                                                animationDuration: isSpeaking ? '0.6s' : '1s',
                                                height: (isSpeaking || isListening) ? `${25 + (Math.random() * 70)}%` : '8px'
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-zinc-100 mb-2">
                                    {isListening ? "I'm listening..." : isSpeaking ? "IDEAMAIT is speaking..." : "Establishing connection..."}
                                </p>
                                <p className="text-[10px] font-black text-[#FF0033] uppercase tracking-[0.3em] animate-pulse">
                                    Hands-Free Interface Ready
                                </p>
                                
                                <div className="mt-16 flex gap-4">
                                    <Button 
                                        variant="outline" 
                                        className="rounded-2xl border-white/10 text-white font-bold text-xs h-11 px-6 hover:bg-white/5"
                                        onClick={() => {
                                            setIsVoiceMode(false);
                                            synthRef.current?.cancel();
                                            recognitionRef.current?.stop();
                                            setIsListening(false);
                                            setIsSpeaking(false);
                                        }}
                                    >
                                        Exit Voice Mode
                                    </Button>
                                    <Button 
                                        className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs h-11 px-6 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                        onClick={() => {
                                            synthRef.current?.cancel();
                                            recognitionRef.current?.stop();
                                            setIsListening(false);
                                            setIsSpeaking(false);
                                        }}
                                    >
                                        Abort Request
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 w-full bg-transparent">
                                <div className="p-8 space-y-8">
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-80 text-center p-8">
                                            <div className="h-20 w-20 rounded-[2rem] bg-[#FF0033]/10 flex items-center justify-center mb-6 border border-[#FF0033]/20 shadow-inner">
                                                <Bot className="h-10 w-10 text-[#FF0033]" />
                                            </div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-loose">
                                                IDEAMAIT ANALYST<br/>
                                                <span className="text-[#FF0033]">Secure Executive Uplink Active</span>
                                            </p>
                                        </div>
                                    )}
                                    {messages.map((message, index) => (
                                        <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                            {message.role === 'model' && (
                                                <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-[#FF0033]/10 text-[#FF0033] flex items-center justify-center border border-[#FF0033]/20 shadow-sm">
                                                    <Bot className="h-5 w-5"/>
                                                </div>
                                            )}
                                            <div className={cn(
                                                "p-5 rounded-2xl max-w-[85%] text-[13px] font-medium leading-relaxed shadow-lg",
                                                message.role === 'user' 
                                                    ? "bg-[#FF0033] text-white rounded-tr-none" 
                                                    : "bg-zinc-900 text-zinc-100 border border-white/5 rounded-tl-none"
                                            )}>
                                                <p className="whitespace-pre-wrap">{renderMessageContent(message.content)}</p>
                                            </div>
                                            {message.role === 'user' && (
                                                <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center border border-white/5 shadow-sm">
                                                    <User className="h-5 w-5"/>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(isLoading || isProcessingFile) && !isVoiceMode && (
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-[#FF0033]/10 text-[#FF0033] flex items-center justify-center border border-[#FF0033]/20">
                                                <Bot className="h-5 w-5"/>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 flex items-center shadow-lg rounded-tl-none">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#FF0033]"/>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollAreaRef} />
                                </div>
                            </ScrollArea>
                            
                            <div className="p-6 bg-zinc-900/50 border-t border-white/5 shrink-0">
                                {stagedFile && (
                                    <div className="mb-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-[#FF0033]/10 border border-[#FF0033]/20 rounded-xl px-3 py-1.5 flex items-center gap-2 max-w-full group">
                                            <Paperclip className="h-3 w-3 text-[#FF0033]" />
                                            <span className="text-[10px] font-black text-[#FF0033] uppercase tracking-widest truncate max-w-[200px]">
                                                {stagedFile.name}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-4 w-4 text-zinc-500 hover:text-white rounded-full p-0"
                                                onClick={() => setStagedFile(null)}
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {hasError && (
                                    <div className="flex justify-center mb-4">
                                        <Button variant="outline" size="sm" onClick={resetHistory} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 border-red-400/20 h-8 bg-red-400/5 px-4 rounded-full">
                                            <RotateCcw className="h-3 w-3 mr-2" />
                                            Reset Session
                                        </Button>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Button 
                                            type="button"
                                            size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute left-1 top-1 h-10 w-10 rounded-xl bg-transparent text-zinc-500 hover:text-[#FF0033] z-10"
                                            disabled={isLoading || isProcessingFile}
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </Button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept=".pdf,.docx,.doc,.txt"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setStagedFile(file);
                                            }}
                                        />
                                        <Input 
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder="Consult IDEAMAIT..."
                                            className="h-12 pl-12 pr-12 rounded-2xl bg-zinc-950 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-[#FF0033]/50 focus-visible:border-[#FF0033]/50 transition-all text-xs font-semibold"
                                            disabled={isLoading || isProcessingFile}
                                        />
                                        <Button 
                                            type="button"
                                            size="icon"
                                            onClick={toggleListening}
                                            className={cn(
                                                "absolute right-1 top-1 h-10 w-10 rounded-xl transition-all",
                                                isListening ? "bg-[#FF0033] text-white ring-4 ring-[#FF0033]/20" : "bg-transparent text-zinc-500 hover:text-[#FF0033]"
                                            )}
                                        >
                                            {isListening ? <Mic className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-2xl bg-[#FF0033] hover:bg-[#FF0033]/80 text-white shadow-[0_0_15px_rgba(255,0,51,0.3)] transition-transform active:scale-95 shrink-0" 
                                        disabled={isLoading || isProcessingFile || (!input.trim() && !stagedFile)}
                                    >
                                        {(isLoading || isProcessingFile) ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
