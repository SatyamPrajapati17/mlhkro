import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Bot, Send, User, Sparkles, AlertCircle, Database, Check, CornerDownRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  toolsUsed?: any[];
  timestamp: string;
}

export const AiPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.initialPrompt || '';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content: `TAK//AI Control Copilot initialized. I have whitelisted read-only access to company telemetry, biometric logs, leave quotas, and compensation records strictly scoped to your role permissions.\n\nAsk me anything or select a prompt below.`,
      sources: ['WorkTak Telemetry Layer'],
      timestamp: '09:00',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.content,
          sources: data.sources,
          toolsUsed: data.toolsUsed,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: `ERROR: ${data.error?.message || 'AI tool execution failed.'}`,
            timestamp: 'NOW',
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `NETWORK ERROR: Failed to connect to TAK//AI backend.`,
          timestamp: 'NOW',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    'Who was late more than 3 times this month?',
    'What is our payroll cost by department?',
    'Show my leave balance quotas for 2026',
    'How many leaves are pending approval?',
    'What risk signals are currently open?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">// ARTIFICIAL INTELLIGENCE & MACHINE LEARNING</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">TAK//AI ASSISTANT</h2>
        </div>
        <Badge status="ACTIVE" label="GEMINI 2.5 FLASH" size="md" />
      </div>

      {/* Chat Conversation Box */}
      <GlassCard variant="yellow" hud className="p-6 bg-wt-black/95 flex flex-col h-[540px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
          {messages.map((m) => {
            const isAssistant = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 bg-wt-yellow text-wt-black border border-wt-white flex items-center justify-center shrink-0 shadow-hardYSm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 border-2 ${
                    isAssistant
                      ? 'border-wt-white bg-wt-black text-wt-white'
                      : 'border-wt-yellow bg-wt-yellow/10 text-wt-yellow'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-wt-white/10 text-[10px] uppercase font-bold text-wt-gray">
                    <span>{isAssistant ? '// TAK//AI' : '// YOU'}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line leading-relaxed text-sm text-wt-white">
                    {m.content}
                  </div>

                  {/* Sources Chips Row */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-wt-white/10 text-[10px]">
                      <span className="text-wt-gray font-bold">SOURCE VERIFIED:</span>
                      {m.sources.map((src, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 border border-wt-yellow/60 bg-wt-black text-wt-yellow font-mono font-bold"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isAssistant && (
                  <div className="w-8 h-8 bg-wt-red text-wt-black border border-wt-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center font-mono text-xs text-wt-yellow p-3 border border-wt-yellow/40 bg-wt-black">
              <span className="w-3 h-3 border-2 border-wt-yellow border-t-transparent animate-spin" />
              <span>INVOKING WHITELISTED TOOL & GENERATING RESPONSE...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="flex flex-wrap gap-2 pt-3 pb-2 border-t border-wt-white/20">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(p)}
              className="text-[11px] font-mono text-wt-gray hover:text-wt-white border border-wt-white/20 hover:border-wt-yellow px-2.5 py-1 bg-wt-black transition-colors"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputPrompt);
          }}
          className="flex gap-2 pt-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Type your question or telemetry query..."
            className="flex-1 bg-wt-black border-2 border-wt-white text-wt-white font-mono text-xs px-4 py-3 outline-none focus:border-wt-yellow placeholder:text-wt-gray"
          />
          <Button variant="primary" size="md" type="submit" disabled={isLoading}>
            <Send className="w-4 h-4 mr-1.5" /> ASK TAK//AI
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
