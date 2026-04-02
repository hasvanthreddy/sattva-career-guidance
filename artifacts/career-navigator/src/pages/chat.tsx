import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send, User, Plus, MessageSquare, Trash2, Menu, Sparkles,
  Phone, Mail, Calendar, GraduationCap, ChevronRight, X, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateOpenaiConversation, useListOpenaiConversations,
  useListOpenaiMessages, useDeleteOpenaiConversation,
} from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/contexts/user";
import { useLanguage } from "@/contexts/language";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  const parseInline = (str: string, key: string | number) => {
    const parts: React.ReactNode[] = [];
    let i = 0;
    let current = "";
    while (i < str.length) {
      if (str[i] === "*" && str[i + 1] === "*") {
        if (current) parts.push(current);
        current = "";
        i += 2;
        let bold = "";
        while (i < str.length && !(str[i] === "*" && str[i + 1] === "*")) {
          bold += str[i++];
        }
        i += 2;
        parts.push(<strong key={`b-${i}`} className="font-bold text-foreground">{bold}</strong>);
      } else if (str[i] === "*" && str[i - 1] !== "*") {
        if (current) parts.push(current);
        current = "";
        i++;
        let italic = "";
        while (i < str.length && str[i] !== "*") {
          italic += str[i++];
        }
        i++;
        parts.push(<em key={`em-${i}`}>{italic}</em>);
      } else if (str[i] === "`") {
        if (current) parts.push(current);
        current = "";
        i++;
        let code = "";
        while (i < str.length && str[i] !== "`") {
          code += str[i++];
        }
        i++;
        parts.push(<code key={`c-${i}`} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{code}</code>);
      } else {
        current += str[i++];
      }
    }
    if (current) parts.push(current);
    return <span key={key}>{parts}</span>;
  };

  let insideList = false;
  const listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-none space-y-1 my-1.5">
          {listItems.map((li, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>{li}</span>
            </li>
          ))}
        </ul>
      );
      listItems.length = 0;
      insideList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      elements.push(<br key={`br-${idx}`} />);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)/);

    if (bulletMatch || numberedMatch) {
      insideList = true;
      const content = bulletMatch ? bulletMatch[1] : numberedMatch![1];
      listItems.push(parseInline(content, idx));
      return;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={idx} className="font-bold text-base mt-3 mb-1">{parseInline(trimmed.slice(4), idx)}</h3>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={idx} className="font-bold text-lg mt-3 mb-1">{parseInline(trimmed.slice(3), idx)}</h2>);
    } else if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={idx} className="font-bold text-xl mt-3 mb-1">{parseInline(trimmed.slice(2), idx)}</h1>);
    } else {
      elements.push(<p key={idx} className="leading-relaxed">{parseInline(trimmed, idx)}</p>);
    }
  });

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

const REAL_COUNSELORS = [
  {
    name: "Dr. Priya Sharma",
    specialty: "Engineering & Technology Careers",
    experience: "12 years",
    rating: 4.9,
    available: true,
    slots: ["Mon 10am–1pm", "Wed 2pm–5pm", "Fri 11am–2pm"],
    contact: "+91 98765 43210",
    email: "priya.sharma@sattvaguide.in",
  },
  {
    name: "Mr. Ravi Kumar",
    specialty: "Medical & Life Sciences",
    experience: "8 years",
    rating: 4.8,
    available: true,
    slots: ["Tue 9am–12pm", "Thu 3pm–6pm", "Sat 10am–1pm"],
    contact: "+91 87654 32109",
    email: "ravi.kumar@sattvaguide.in",
  },
  {
    name: "Ms. Anjali Reddy",
    specialty: "Arts, Commerce & Management",
    experience: "10 years",
    rating: 4.9,
    available: false,
    slots: ["Mon 3pm–6pm", "Wed 10am–1pm"],
    contact: "+91 76543 21098",
    email: "anjali.reddy@sattvaguide.in",
  },
];

const SUGGESTIONS = [
  "How do I get into software engineering?",
  "What skills should I learn for data science?",
  "How to prepare for campus placements?",
  "Which career suits an introvert?",
  "What are JEE preparation tips?",
  "How to crack EAMCET for engineering?",
];

export default function Chat() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "real">("ai");
  const [bookingCounselor, setBookingCounselor] = useState<typeof REAL_COUNSELORS[0] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, sessionData } = useUser();
  const { t } = useLanguage();

  const { data: conversations = [], refetch: refetchConvs } = useListOpenaiConversations();
  const { data: messages = [], refetch: refetchMessages } = useListOpenaiMessages(activeConvId || 0, {
    query: { enabled: !!activeConvId }
  });

  const createConv = useCreateOpenaiConversation();
  const deleteConv = useDeleteOpenaiConversation();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
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
    createConv.mutate({ data: { title: "New Session" } }, {
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
      const response = await fetch(`${BASE}/api/openai/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          userContext: sessionData.grade ? `Student Standard: ${sessionData.grade}` : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
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

  const Sidebar = () => (
    <div className="flex flex-col h-full border-r border-border w-full shrink-0 p-4 bg-background">
      <Button
        onClick={handleCreateNew}
        className="w-full gap-2 mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={createConv.isPending}
      >
        <Plus className="w-4 h-4" /> New Session
      </Button>

      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Chats</div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 pr-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                activeConvId === conv.id ? "bg-primary/10 border border-primary/30" : "hover:bg-accent border border-transparent"
              }`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeConvId === conv.id ? "text-primary" : "text-muted-foreground"}`} />
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
    <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      <div className="hidden md:flex w-64">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
        <div className="border-b border-border bg-background">
          <div className="md:hidden flex items-center p-3 gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-border bg-background w-72">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <span className="font-semibold">Career Guidance</span>
          </div>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "ai" | "real")} className="px-4 pb-0">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Sparkles className="w-4 h-4" /> {t("chat.aiMentor")}
              </TabsTrigger>
              <TabsTrigger value="real" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <UserCheck className="w-4 h-4" /> {t("chat.realGuider")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === "ai" ? (
          !activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center w-full max-w-md"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Meet Sattva 🌟</h2>
                <p className="text-muted-foreground max-w-sm mb-2">
                  Your personal AI career mentor. Ask anything about careers, skills, interviews, or your future.
                </p>
                {sessionData.grade && (
                  <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Personalized for {t(`grade.${sessionData.grade}`) || sessionData.grade} students
                  </div>
                )}
                <Button onClick={handleCreateNew} size="lg" className="bg-primary text-primary-foreground mb-8 rounded-full px-8">
                  Start New Conversation
                </Button>
                <div className="grid sm:grid-cols-2 gap-3 w-full">
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
                  <div className="font-semibold text-sm">Sattva Career Mentor 🤖</div>
                  <div className="text-xs text-muted-foreground">
                    {sessionData.grade ? `Personalized for ${t(`grade.${sessionData.grade}`) || sessionData.grade}` : "Always here to guide you"}
                  </div>
                </div>
              </div>

              <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6 pb-4">
                  {messages.length === 0 && !isStreaming && (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground">Ask Sattva anything about your career path. 💬</p>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-tr from-primary to-teal-400"
                      }`}>
                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border rounded-tl-sm"
                      }`}>
                        {msg.role === "user" ? (
                          <span>{msg.content}</span>
                        ) : (
                          renderMarkdown(msg.content)
                        )}
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
                      <div className="px-4 py-3 rounded-2xl max-w-[85%] text-sm md:text-base bg-card border border-border rounded-tl-sm">
                        {streamingText ? (
                          renderMarkdown(streamingText)
                        ) : (
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
                    placeholder="Ask Sattva for career advice... 💬"
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
          )
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">👩‍🏫 Talk to a Real Counselor</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Connect with experienced career counselors who specialize in Indian education and career paths.
                </p>
              </div>

              <div className="space-y-4">
                {REAL_COUNSELORS.map((c) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`border-border hover:border-primary/30 transition-all hover:shadow-lg ${!c.available ? "opacity-70" : ""}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {c.name.split(" ")[1]?.[0] || c.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="font-bold text-base">{c.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                c.available ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                              }`}>
                                {c.available ? "🟢 Available" : "🔴 Busy"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{c.specialty}</p>
                            <p className="text-xs text-muted-foreground">⭐ {c.rating} · {c.experience} experience</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {c.slots.map(slot => (
                                <span key={slot} className="text-xs bg-muted px-2 py-0.5 rounded-md">📅 {slot}</span>
                              ))}
                            </div>
                            <div className="flex gap-3 mt-3">
                              <Button
                                size="sm"
                                className="gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs"
                                disabled={!c.available}
                                onClick={() => setBookingCounselor(c)}
                              >
                                <Calendar className="w-3.5 h-3.5" /> Book Session
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                                <a href={`tel:${c.contact}`}>
                                  <Phone className="w-3.5 h-3.5" /> Call
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                                <a href={`mailto:${c.email}`}>
                                  <Mail className="w-3.5 h-3.5" /> Email
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {bookingCounselor && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                >
                  <Card className="w-full max-w-md border-border bg-background shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Book Session with {bookingCounselor.name}</h3>
                        <button onClick={() => setBookingCounselor(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Choose a time slot:</p>
                        {bookingCounselor.slots.map(slot => (
                          <button
                            key={slot}
                            className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-sm transition-all flex items-center justify-between"
                            onClick={() => {
                              setBookingCounselor(null);
                              alert(`✅ Session booked for ${slot} with ${bookingCounselor.name}!\n\nYou will receive a confirmation on ${user?.email || "your email"}.`);
                            }}
                          >
                            <span>📅 {slot}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ))}
                        <div className="pt-3 border-t border-border space-y-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> {bookingCounselor.contact}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> {bookingCounselor.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
