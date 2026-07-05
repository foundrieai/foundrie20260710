'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @fileOverview A hook for managing the Web Speech API lifecycle.
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS) for IDEAMAIT.
 * Updated with AudioContext resurrection and recognition loop persistence.
 */

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseVoiceAnalystProps {
  onSendMessage: (text: string) => void;
  enabled: boolean;
}

export function useVoiceAnalyst({ onSendMessage, enabled }: UseVoiceAnalystProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const stateRef = useRef<VoiceState>('idle');
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabledRef = useRef(enabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  const resumeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn('[VoiceEngine] AudioContext resume failed:', e);
    }
  }, []);

  const stopEverything = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setState('idle');
    stateRef.current = 'idle';
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !isEnabledRef.current) return;
    
    await resumeAudioContext();
    
    try {
      recognitionRef.current.start();
      setState('listening');
      stateRef.current = 'listening';
    } catch (e) {
      // recognition already started or busy
    }
  }, [resumeAudioContext]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK English Male')) || 
                          voices.find(v => v.name.includes('Premium')) ||
                          voices.find(v => v.lang.startsWith('en-GB')) ||
                          voices.find(v => v.lang.startsWith('en')) ||
                          voices[0];
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setState('speaking');
      stateRef.current = 'speaking';
    };
    utterance.onend = () => {
      setState('idle');
      stateRef.current = 'idle';
      // Hands-free loop: resume listening after AI finishes speaking
      if (isEnabledRef.current) {
        setTimeout(startListening, 100); 
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [startListening]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript = event.results[i][0].transcript;
          }
        }

        if (currentTranscript.trim()) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isEnabledRef.current) {
              onSendMessage(currentTranscript.trim());
              recognition.stop(); // Stop to process
              setState('processing');
              stateRef.current = 'processing';
            }
          }, 1500);
        }
      };

      recognition.onend = () => {
        // Critical Loop: If enabled but not processing/speaking, restart listening
        if (isEnabledRef.current && stateRef.current !== 'processing' && stateRef.current !== 'speaking') {
          try { recognition.start(); } catch(e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      stopEverything();
    };
  }, [onSendMessage, stopEverything, state]);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopEverything();
    }
  }, [enabled, startListening, stopEverything]);

  return {
    state,
    speak,
    stopEverything,
  };
}
