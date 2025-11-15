import { useState, useRef, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Markdown } from "@/lib/markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot = ({ isOpen, onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! 👋 Soy RAI, tu asesor inteligente de RV2. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: "", email: "", phone: "" });
  const [collectingContact, setCollectingContact] = useState(false);
  const [contactStep, setContactStep] = useState<'name' | 'email' | 'phone' | 'done'>('name');
  const [startTime] = useState(() => new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }));
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendChatTranscript = async () => {
    if (messages.length === 0 || contactStep !== 'done') return;

    try {
      const endTime = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });
      
      const mailEndpoint = import.meta.env.VITE_MAIL_API_URL || '/api/send-mail';

      const response = await fetch(mailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          visitorName: contactInfo.name || 'Visitante Anónimo',
          visitorEmail: contactInfo.email,
          visitorPhone: contactInfo.phone,
          startTime,
          endTime,
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al enviar la transcripción');
      }

      console.log('Chat transcript sent successfully');
      toast({
        title: "¡Gracias!",
        description: "Tu conversación ha sido enviada. Te contactaremos pronto.",
      });
    } catch (error) {
      console.error('Error sending chat transcript:', error);
    }
  };

  const handleClose = () => {
    if (contactStep === 'done') {
      sendChatTranscript();
    }
    onClose();
  };

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Límite excedido",
            description: "Por favor espera un momento antes de enviar otro mensaje.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Servicio temporalmente no disponible",
            description: "Inténtalo de nuevo más tarde.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Error al iniciar conversación");
      }

      const data = await response.json();

      if (!data?.success || !data?.message) {
        throw new Error(data?.message || "Respuesta inválida del asistente");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: String(data.message),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };

    // Handle contact info collection
    if (collectingContact) {
      setMessages((prev) => [...prev, userMessage]);
      
      if (contactStep === 'name') {
        setContactInfo(prev => ({ ...prev, name: input.trim() }));
        setMessages((prev) => [...prev, { 
          role: "assistant", 
          content: "Perfecto. ¿Cuál es tu correo electrónico?" 
        }]);
        setContactStep('email');
        setInput("");
        return;
      } else if (contactStep === 'email') {
        setContactInfo(prev => ({ ...prev, email: input.trim() }));
        setMessages((prev) => [...prev, { 
          role: "assistant", 
          content: "Excelente. ¿Y tu número de teléfono?" 
        }]);
        setContactStep('phone');
        setInput("");
        return;
      } else if (contactStep === 'phone') {
        setContactInfo(prev => ({ ...prev, phone: input.trim() }));
        setMessages((prev) => [...prev, { 
          role: "assistant", 
          content: "¡Muchas gracias! He guardado tu información y te enviaremos el resumen de nuestra conversación. Un asesor se pondrá en contacto contigo pronto. 🎉" 
        }]);
        setContactStep('done');
        setCollectingContact(false);
        setInput("");
        // Send transcript after collecting all info
        setTimeout(() => {
          sendChatTranscript();
        }, 1000);
        return;
      }
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check if user is saying goodbye
    const farewellWords = ['gracias', 'adiós', 'adios', 'chao', 'hasta luego', 'nos vemos', 'bye'];
    const isFarewell = farewellWords.some(word => input.toLowerCase().includes(word));

    if (isFarewell && contactStep === 'name') {
      // Start collecting contact info
      setCollectingContact(true);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "¡Fue un gusto ayudarte! Antes de despedirnos, ¿podrías compartirme tu nombre?" 
      }]);
      return;
    }

    setIsLoading(true);
    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">RAI - Asistente RV2</h3>
                <p className="text-xs text-primary-foreground/80">
                  Experto en Recorridos Virtuales
                </p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Markdown content={message.content} className="text-sm" />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                        ●
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                        ●
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
