import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Plus, MessageSquare, Trash2, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateOpenaiConversation, useListOpenaiConversations, useListOpenaiMessages, useDeleteOpenaiConversation } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Chat() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], refetch: refetchConvs } = useListOpenaiConversations();
  const { data: messages = [], refetch: refetchMessages } = useListOpenaiMessages(activeConvId || 0, {
    query: { enabled: !!activeConvId }
  });

  const createConv = useCreateOpenaiConversation();
  const deleteConv = useDeleteOpenaiConversation();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, streamingText]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleCreateNew = () => {
    createConv.mutate({ data: { title: `New Session` } }, {
      onSuccess: (res) => {
        setActiveConvId(res.id);
        refetchConvs();
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteConv.mutate({ id }, {
      onSuccess: () => {
        if (activeConvId === id) setActiveConvId(null);
        refetchConvs();
      }
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !activeConvId || isStreaming) return;

    const message = input;
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    try {
      const response = await fetch(`/api/openai/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setStreamingText(prev => prev + data.content);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      refetchMessages();
    }
  };

  const SUGGESTIONS = [
    "How do I get into software engineering?",
    "What skills should I learn for data science?",
    "How to prepare for campus placements?",
    "Which career suits an introvert?",
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full border-r border-border w-full shrink-0 p-4 bg-background">
      <Button onClick={handleCreateNew} className="w-full gap-2 mb-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={createConv.isPending}>
        <Plus className="w-4 h-4" /> New Session
      </Button>

      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Chats</div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 pr-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                activeConvId === conv.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent border border-transparent'
              }`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeConvId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm truncate font-medium">{conv.title}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                className="text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-sm text-muted-foreground text-center p-4">No conversations yet.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="hidden md:flex w-64">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col relative bg-background">
        <div className="md:hidden flex items-center p-4 border-b border-border bg-background z-10 gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-border bg-background w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Sattva Career Mentor</span>
          </div>
        </div>

        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-primary to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Meet Sattva</h2>
              <p className="text-muted-foreground max-w-sm mb-2">
                Your personal AI career mentor. Ask anything about careers, skills, interviews, or your future.
              </p>
              <p className="text-xs text-muted-foreground mb-8 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                Powered by Sattva AI — friendly, structured, actionable guidance
              </p>
              <Button onClick={handleCreateNew} size="lg" className="bg-primary text-primary-foreground mb-8 rounded-full px-8">
                Start New Conversation
              </Button>
              <div className="grid sm:grid-cols-2 gap-3 w-full max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => { handleCreateNew(); setInput(s); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center px-6 py-3 border-b border-border bg-background gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">Sattva Career Mentor</div>
                <div className="text-xs text-muted-foreground">Always here to guide you</div>
              </div>
            </div>

            <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8">
              <div className="max-w-3xl mx-auto space-y-6 pb-4">
                {messages.length === 0 && !isStreaming && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">Ask Sattva anything about your career path.</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-tr from-primary to-teal-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-card border border-border rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 flex-row"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary to-teal-400">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed bg-card border border-border rounded-tl-sm whitespace-pre-wrap">
                      {streamingText || (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]"></span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 md:p-6 bg-background border-t border-border">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Sattva for career advice..."
                  className="w-full pl-4 pr-14 h-14 text-base rounded-xl border-border bg-card focus-visible:ring-primary"
                  disabled={isStreaming}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
                  disabled={!input.trim() || isStreaming}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
