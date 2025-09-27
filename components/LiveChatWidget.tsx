
import React, { useState, useEffect, useRef } from 'react';
// Fix: The `LiveSession` type is not exported by the `@google/genai` library. It has been removed from this import.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import Spinner from './Spinner';
import { isAiConfigured } from '../services/geminiService';

// Fix: A local `LiveSession` interface is defined based on its usage within this component
// to maintain type safety for the session object, as the official type is not exported.
interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: Blob }): void;
}

// --- Audio Encoding/Decoding Helpers ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Fix: Added createBlob helper function as recommended by the @google/genai guidelines for creating audio blobs.
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    // The supported audio MIME type is 'audio/pcm'. Do not use other types.
    mimeType: 'audio/pcm;rate=16000',
  };
}


const LiveChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [sessionPromise, setSessionPromise] = useState<Promise<LiveSession> | null>(null);
    const [transcripts, setTranscripts] = useState<{ author: 'user' | 'model'; text: string; id: number }[]>([]);
    
    const transcriptsEndRef = useRef<HTMLDivElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    const widgetRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const scrollToBottom = () => {
        transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [transcripts]);
    
    useEffect(() => {
        if (isOpen) {
            startSession();
            setTimeout(() => {
              const closeButton = widgetRef.current?.querySelector('button[aria-label="Close chat"]');
              (closeButton as HTMLElement)?.focus();
            }, 100);
        } else {
            stopSession();
            triggerRef.current?.focus();
        }
        
        return () => {
            stopSession();
        }
    }, [isOpen]);

    const startSession = async () => {
        setStatus('connecting');
        setTranscripts([]);
        currentInputRef.current = '';
        currentOutputRef.current = '';
        
        // Gracefully handle missing API key before attempting to connect.
        if (!isAiConfigured()) {
            console.error("Gemini API key is not configured.");
            setStatus('error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const newSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        // Fix: Cast window to any to access webkitAudioContext for broader browser support.
                        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        audioContextRef.current = inputAudioContext;
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            // Fix: Using the recommended createBlob helper for efficiency and guideline compliance.
                            const pcmBlob = createBlob(inputData);
                            newSessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                        setStatus('listening');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        handleServerMessage(message);
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus('error');
                    },
                    onclose: (e: CloseEvent) => {
                       setStatus('idle');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: 'You are a friendly and helpful tutor for the Yay Mon Digital Learning Platform. Keep your answers concise and encouraging.',
                },
            });
            setSessionPromise(newSessionPromise);

        } catch (error) {
            console.error('Failed to start session or get media:', error);
            setStatus('error');
        }
    };

    const stopSession = () => {
        if (sessionPromise) {
            sessionPromise.then(session => session.close());
            setSessionPromise(null);
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
         if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        for (const source of audioSourcesRef.current.values()) {
          source.stop();
        }
        audioSourcesRef.current.clear();
        setStatus('idle');
    };

    const handleServerMessage = async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
            currentInputRef.current += message.serverContent.inputTranscription.text;
        }
        if (message.serverContent?.outputTranscription) {
            currentOutputRef.current += message.serverContent.outputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
            if (currentInputRef.current) {
                setTranscripts(prev => [...prev, { author: 'user', text: currentInputRef.current, id: Date.now() }]);
                currentInputRef.current = '';
            }
            if (currentOutputRef.current) {
                setTranscripts(prev => [...prev, { author: 'model', text: currentOutputRef.current, id: Date.now() + 1 }]);
                currentOutputRef.current = '';
            }
        }
        
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
            if (!outputAudioContextRef.current) {
                // Fix: Cast window to any to access webkitAudioContext for broader browser support.
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const outputCtx = outputAudioContextRef.current;
            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
            
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            
            source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                    setStatus('listening');
                }
            };
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
            setStatus('speaking');
        }
    };
    
    const getStatusText = () => {
        switch(status) {
            case 'connecting': return 'Connecting...';
            case 'listening': return 'Listening... ask me anything!';
            case 'speaking': return 'AI Tutor is speaking...';
            case 'error': return 'AI Tutor unavailable';
            default: return 'Click to start the AI Tutor';
        }
    };

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[999] w-16 h-16 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-red-700 transform hover:scale-110 transition-all duration-300"
                aria-label={isOpen ? "Close AI Tutor Chat" : "Open AI Tutor Chat"}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                )}
            </button>

            {isOpen && (
                <div 
                  ref={widgetRef}
                  role="dialog"
                  aria-labelledby="ai-tutor-title"
                  className="fixed bottom-24 right-6 z-[998] w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden transform-gpu transition-all duration-300 origin-bottom-right animate-[slide-in_0.3s_ease-out]">
                    <style>{`@keyframes slide-in { 0% { opacity: 0; transform: translateY(20px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h3 id="ai-tutor-title" className="font-bold text-lg text-dark dark:text-light">Yay Mon AI Tutor</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close chat">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <main className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                        <div className="space-y-4">
                            {transcripts.length === 0 && status !== 'connecting' && status !== 'error' && (
                                <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                                    <p className="font-semibold">Welcome!</p>
                                    <p className="text-sm">Speak into your microphone to start a conversation with your AI Tutor.</p>
                                </div>
                            )}
                             {status === 'error' && (
                                <div role="alert" className="text-center text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="font-semibold">AI Tutor Unavailable</p>
                                    <p className="text-sm">The AI Tutor could not be started due to a configuration issue. Please contact an administrator.</p>
                                </div>
                            )}
                            {transcripts.map(t => (
                                <div key={t.id} className={`flex ${t.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <p className={`max-w-[80%] rounded-2xl px-4 py-2 ${t.author === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-dark dark:text-light rounded-bl-none'}`}>
                                        {t.text}
                                    </p>
                                </div>
                            ))}
                            <div ref={transcriptsEndRef} />
                        </div>
                    </main>
                    <footer role="status" aria-live="polite" className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                       {status === 'connecting' ? <Spinner className="w-5 h-5 text-primary" /> : (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${status === 'listening' ? 'text-primary animate-pulse' : ''} ${status === 'speaking' ? 'text-secondary' : ''} ${status === 'error' ? 'text-red-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                       )}
                       <p className="font-medium">{getStatusText()}</p>
                    </footer>
                </div>
            )}
        </>
    );
};

export default LiveChatWidget;