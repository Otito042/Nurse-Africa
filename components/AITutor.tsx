
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, MessageSender } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { SendIcon } from './icons/SendIcon';

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const initializeChat = useCallback(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are an AI Tutor for African student nurses. Your goal is to explain nursing concepts clearly and concisely. 
      You must not provide any prescriptive clinical instructions or medical advice. All your guidance should be educational and theoretical. 
      Always encourage students to consult with their clinical instructors, supervisors, and preceptors for real-world patient care decisions. 
      Frame your answers to be supportive, encouraging, and culturally relevant to the African context where appropriate. Start the conversation by warmly welcoming the user.`;

      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        }
      });
      
      setMessages([
          {
            id: 'init',
            text: "Hello! I'm your AI Nursing Tutor. How can I help you with your studies today? Feel free to ask me about nursing concepts, patient care theory, or exam preparation.",
            sender: MessageSender.AI
          }
      ]);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred during initialization.");
    }
  }, []);

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.USER,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: response.text,
        sender: MessageSender.AI,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      console.error("Error sending message:", e);
      const errorMessage = "Sorry, I couldn't process your request right now. Please check your connection or API key and try again.";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { id: 'error-' + Date.now(), text: errorMessage, sender: MessageSender.AI },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === MessageSender.USER ? 'justify-end' : ''
              }`}
            >
              {msg.sender === MessageSender.AI && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BotIcon className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <div
                className={`max-w-md p-4 rounded-2xl ${
                  msg.sender === MessageSender.USER
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === MessageSender.USER && (
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                   <UserIcon className="w-5 h-5 text-gray-600" />
                 </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="max-w-md p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
       {error && <div className="p-4 text-center text-red-600 bg-red-100 border-t border-gray-200 text-sm">{error}</div>}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a nursing topic..."
            className="flex-1 w-full px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;
