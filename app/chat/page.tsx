"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, Loader2, Sparkles, Plus, MessageSquare, Menu, X, BrainCircuit, BookOpen, Paperclip, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChatMessage } from "@/components/chat/chat-message"
import { cn } from "@/lib/utils"

type Message = {
  _id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}

type ChatHistory = {
  _id: string;
  title: string;
}

const TEMPLATES = [
  { icon: BrainCircuit, title: "Explain a concept", prompt: "Explain the concept of quantum entanglement like I'm 5 years old." },
  { icon: BookOpen, title: "Summarize notes", prompt: "Summarize the key differences between mitosis and meiosis." },
  { icon: MessageSquare, title: "Generate questions", prompt: "Generate 3 multiple-choice practice questions about the French Revolution." },
];

function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [documents, setDocuments] = useState<{ _id: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("id");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchDocuments(chatId);
    } else {
      setDocuments([]);
    }
  }, [chatId]);

  useEffect(() => {
    if (urlChatId) {
      if (urlChatId !== chatId) {
        loadChat(urlChatId);
      }
    } else {
      if (chatId !== null) {
        startNewChat();
      }
    }
  }, [urlChatId]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (data.chats) setChats(data.chats);
    } catch (e) {
      console.error(e);
    }
  }

  const fetchDocuments = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}/documents`);
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch (e) {
      console.error(e);
    }
  }

  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!(window as any).pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = async () => {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            try {
              const text = await parsePdfBuffer(pdfjsLib, arrayBuffer);
              resolve(text);
            } catch (err) {
              reject(err);
            }
          };
          script.onerror = () => reject(new Error("Failed to load PDF.js library"));
          document.head.appendChild(script);
        } else {
          const pdfjsLib = (window as any).pdfjsLib;
          const text = await parsePdfBuffer(pdfjsLib, arrayBuffer);
          resolve(text);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  const parsePdfBuffer = async (pdfjsLib: any, arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }
    setIsUploading(true);
    try {
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText.trim()) {
        throw new Error("Could not extract text from this PDF (empty or scanned).");
      }
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          name: file.name,
          content: extractedText,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload document");
      }
      const data = await res.json();
      if (data.chatId && !chatId) {
        setChatId(data.chatId);
        router.push(`/chat?id=${data.chatId}`);
        fetchChats();
      }
      if (data.chatId) {
        fetchDocuments(data.chatId);
      }
      setMessages(prev => [
        ...prev,
        { role: "system", content: `Uploaded document: "${file.name}" successfully. You can now ask questions about this document!` }
      ]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to parse and upload PDF");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const loadChat = async (id: string) => {
    setChatId(id);
    setIsSidebarOpen(false);
    if (searchParams.get("id") !== id) {
      router.push(`/chat?id=${id}`);
    }
    try {
      const res = await fetch(`/api/chats/${id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const startNewChat = () => {
    setChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
    if (searchParams.get("id")) {
      router.push('/chat');
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setInput("");
    
    // Optimistic UI update
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, chatId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await res.json();
      
      if (data.chatId && !chatId) {
        setChatId(data.chatId);
        router.push(`/chat?id=${data.chatId}`);
        fetchChats(); // refresh sidebar
      }

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const handleTemplateClick = (prompt: string) => {
    sendMessage(prompt);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-card text-card-foreground transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-border",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <Button 
              onClick={startNewChat} 
              variant="outline" 
              className="flex-1 justify-start gap-2 border-border bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Button 
              onClick={() => setIsSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-8 flex-1 overflow-y-auto">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Chats
            </h3>
            <div className="space-y-1">
              {chats.map(chat => (
                <button
                  key={chat._id}
                  onClick={() => loadChat(chat._id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left truncate",
                    chatId === chat._id 
                      ? "bg-accent text-accent-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        
        {/* Mobile Header */}
        <div className="flex h-14 items-center border-b px-4 lg:hidden bg-background z-10 sticky top-0 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="-ml-2">
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-2 font-semibold">EduVerse Chat</span>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-4xl">
            
            {messages.length === 0 ? (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight">How can I help you study?</h2>
                <p className="mb-8 text-muted-foreground">Select a template or start typing below to begin.</p>
                
                <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
                  {TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTemplateClick(template.prompt)}
                      className="group flex flex-col items-start gap-2 rounded-2xl border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
                    >
                      <template.icon className="h-5 w-5 text-primary opacity-80 transition-transform group-hover:scale-110" />
                      <div className="font-medium text-sm">{template.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{template.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <ChatMessage key={msg._id || idx} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-8">
                    <div className="flex max-w-full md:max-w-[80%] gap-4 flex-row">
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm bg-primary text-primary-foreground mt-1">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="px-5 py-3 rounded-none bg-transparent flex items-center">
                        <span className="text-muted-foreground text-sm flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-gradient-to-t from-background via-background to-background/95 pt-4 pb-6 px-4 shrink-0 border-t border-border/10">
          <div className="mx-auto max-w-3xl">
            {/* Uploaded Documents List */}
            {documents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 px-2">
                {documents.map((doc) => (
                  <div 
                    key={doc._id} 
                    className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300 shadow-sm"
                  >
                    <FileText className="h-3 w-3 text-primary animate-pulse" />
                    <span className="max-w-[150px] truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <form 
              onSubmit={handleSubmit} 
              className="relative flex items-end rounded-3xl border bg-background/80 shadow-lg backdrop-blur-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all p-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="mb-1 ml-1 h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
                <span className="sr-only">Upload PDF</span>
              </Button>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message EduVerse..."
                className="max-h-[200px] min-h-[44px] w-full resize-none border-0 bg-transparent px-4 py-3 focus-visible:ring-0 shadow-none text-foreground"
                rows={1}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isLoading}
                className="mb-1 mr-1 h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
            <div className="mt-3 text-center text-[11px] text-muted-foreground font-medium">
              EduVerse AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
