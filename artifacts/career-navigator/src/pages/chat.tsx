import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Plus, MessageSquare, Trash2, Menu } from "lucide-react";
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, streamingText]);

  // Select first conversation if none selected
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleCreateNew = () => {
    const career = localStorage.getItem("selected_career") || "Career";
    createConv.mutate({ data: { title: `${career} Mentorship` } }, {
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

    // Optimistic update handled by just refetching messages
    // Real implementation:
    try {
      const response = await fetch(`/api/openai/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setStreamingText(prev => prev + data.content);
              }
              if (data.done) {
                break;
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      refetchMessages();
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-black/20 border-r border-white/10 w-full md:w-64 shrink-0 p-4">
      <Button onClick={handleCreateNew} className="w-full gap-2 mb-6 bg-primary hover:bg-primary/90 text-white">
        <Plus className="w-4 h-4" /> New Session
      </Button>
      
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Chats</div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                activeConvId === conv.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'
              }`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate text-white/80">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                className="text-muted-foreground hover:text-rose-400 p-1"
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
    <div className="flex-1 flex overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-background/80 backdrop-blur-sm z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-white/10 bg-background w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="font-medium text-sm">AI Career Mentor</span>
        </div>

        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Career Mentor</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Get personalized advice on interviews, resume building, skill acquisition, or salary negotiation.
            </p>
            <Button onClick={handleCreateNew} size="lg" className="bg-primary text-white">Start New Conversation</Button>
          </div>
        ) : (
          <>
            <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8">
              <div className="max-w-3xl mx-auto space-y-6 pb-20">
                {messages.length === 0 && !isStreaming && (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">Ask anything about your career path.</p>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/10 border border-white/20'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed ${
                      msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'glass-panel border-white/10 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isStreaming && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 flex-row"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed glass-panel border-white/10 rounded-tl-sm">
                      {streamingText || <span className="animate-pulse text-muted-foreground">Thinking...</span>}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-white/10">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for interview tips, salary negotiation advice..."
                  className="w-full pl-4 pr-12 h-14 bg-white/5 border-white/20 text-base focus-visible:ring-primary rounded-xl"
                  disabled={isStreaming}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary hover:bg-primary/90 text-white rounded-lg"
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
