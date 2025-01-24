import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send } from 'lucide-react';
import { useChat } from '@/lib/store';
import ChatMessage from './ChatMessage';
import { useForm } from 'react-hook-form';

interface ChatForm {
  message: string;
}

export default function ChatPanel() {
  const { messages, isOpen, isTyping, addMessage, setIsOpen, setIsTyping } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<ChatForm>();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = "I'm here to help! ";
    
    if (userMessage.toLowerCase().includes('price')) {
      response += "Our services start from ₹499 for basic cleaning. Would you like to see our full price list?";
    } else if (userMessage.toLowerCase().includes('book')) {
      response += "I can help you book a service. What type of cleaning service are you interested in?";
    } else if (userMessage.toLowerCase().includes('contact')) {
      response += "You can reach us at 89569 93132 or through our contact form. Would you like me to direct you there?";
    } else {
      response += "How can I assist you with our cleaning services today?";
    }

    addMessage({
      role: 'assistant',
      content: response,
    });
    
    setIsTyping(false);
  };

  const onSubmit = async (data: ChatForm) => {
    if (!data.message.trim()) return;
    
    addMessage({
      role: 'user',
      content: data.message,
    });
    
    reset();
    await simulateResponse(data.message);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-28 right-4 w-96 bg-background border rounded-lg shadow-lg overflow-hidden z-40"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Chat with SafaiWalay</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-96 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-2 text-muted-foreground">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    •
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    •
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  >
                    •
                  </motion.span>
                </div>
              )}
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 border-t flex gap-2"
          >
            <Input
              {...register('message')}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}