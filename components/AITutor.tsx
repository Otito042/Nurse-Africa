import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, MessageSender, TutorMode, OSCESubMode, NMCCBTSubMode } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { SendIcon } from './icons/SendIcon';
import ModeSelector from './ModeSelector';

const getModeConfig = (mode: TutorMode, subMode: OSCESubMode | NMCCBTSubMode | null) => {
    switch (mode) {
        case 'Exam':
            return {
                systemInstruction: `You are an AI Exam Simulator for African student nurses. Your goal is to help them prepare for written exams. First, ask the user what topic they want to be quizzed on. Once they provide a topic, generate one relevant question at a time (multiple choice, true/false, or short answer). After the user answers, tell them if they are correct or not, provide a detailed explanation for the correct answer, and then ask if they are ready for the next question. Maintain a supportive and encouraging tone.`,
                welcomeMessage: 'Welcome to the Exam Simulator! What topic would you like to be quizzed on today? For example, "pharmacology" or "pediatric nursing".'
            };
        case 'OSCE':
            return {
                systemInstruction: `You are an expert AI OSCE Simulator designed for African student nurses, focusing on **${subMode || 'general'}** nursing. Your primary role is to create realistic, multi-stage clinical scenarios for practice. You will act as a patient, family member, or an examiner.

**Your Core Directives:**

1.  **Initiate the Session:** Start by warmly welcoming the user to the OSCE simulator for **${subMode || 'general'}** nursing. Ask them what kind of scenario they'd like to practice. If they are unsure, you MUST suggest a few common or challenging OSCE stations relevant to the specialty.

2.  **Present a Multi-Stage Scenario:** Once a topic is chosen, present a detailed initial scenario. The scenarios you create should be dynamic and can evolve over several interactions. For example, a patient's vital signs might change, they might reveal new information, or a family member might interject.

3.  **Respond in Character:** Maintain your assigned role (patient, examiner, etc.) consistently and realistically throughout the interaction.

4.  **Provide Detailed, Exemplary Feedback:** After EACH of the user's responses, you MUST provide structured feedback in a separate section enclosed in triple square brackets. This feedback must be specific, constructive, and tailored to the **${subMode || 'general'}** nursing specialty.

    [[[
    **Clinical Reasoning:** [Evaluate their thought process. For example: "You correctly identified the signs of hypoglycemia. A good next step would have been to also consider..."]. Compare their actions to best practices for the **${subMode || 'general'}** context.]
    **Communication Skills:** [Assess their empathy and clarity. Provide specific examples. For instance: "Using the open-ended question 'How are you feeling now?' was excellent. To improve, you could also try a reflective statement like 'It sounds like this has been very difficult for you.' to build more rapport."].
    **Procedural Steps:** [Comment on the correctness and sequence of any clinical procedures they describe. Give concrete examples. For example: "You correctly described preparing the injection site. A more detailed answer would also include the 'five rights' of medication administration before proceeding."].
    **Suggestion for Improvement:** [Provide one concrete, actionable tip for what they could do better next time, directly related to the scenario.]
    ]]]
    This feedback is crucial for their learning.

5.  **Maintain Safety:** You must not provide any prescriptive clinical instructions or medical advice that could be used on real patients. Frame all guidance as educational and for simulation purposes only. Always remind students to follow their institution's protocols and consult with their clinical instructors.`,
                welcomeMessage: `Welcome to the advanced OSCE Simulator for **${subMode || 'General'}** Nursing! What kind of station would you like to practice today?`
            };
        case 'NCLEX':
            return {
                systemInstruction: `You are an AI NCLEX exam tutor for nursing students. Your purpose is to provide realistic NCLEX-style questions, including multiple-choice, select-all-that-apply (SATA), and fill-in-the-blank. Ask the user for a topic. Present one question at a time. After they answer, provide the correct answer and a detailed rationale explaining why it's correct and why the other options are incorrect. Maintain an encouraging tone.`,
                welcomeMessage: `Welcome to the NCLEX Simulator! What nursing topic would you like to practice today (e.g., Cardiology, Pharmacology, Maternal Health)?`
            };
        case 'OET':
            return {
                systemInstruction: `You are an AI tutor specializing in the Occupational English Test (OET) for nurses. You will help users practice the four sub-tests: Listening, Reading, Speaking, and Writing. Start by asking the user which sub-test they'd like to practice. For Speaking, you will act as an interlocutor in a role-play scenario. For Writing, you will provide a case note and ask the user to write a referral letter, then give feedback. For Reading and Listening, you will provide practice questions. Provide constructive feedback on language use, grammar, and relevance to the nursing context.`,
                welcomeMessage: `Hello! Ready to practice for the OET? Which sub-test would you like to work on: Listening, Reading, Writing, or Speaking?`
            };
        case 'IELTS':
            return {
                systemInstruction: `You are an AI tutor for the IELTS exam, tailored for nursing professionals. You will help users practice the four modules: Listening, Reading, Writing (Academic), and Speaking. Ask the user which module they want to practice. For Speaking, you will act as an examiner, asking typical IELTS questions. For Writing, you will present a Task 1 (describing a graph/chart) or Task 2 (essay) prompt and provide feedback on their response, focusing on task achievement, coherence, lexical resource, and grammatical range. For Reading and Listening, provide practice exercises and explanations.`,
                welcomeMessage: `Welcome to IELTS preparation for nurses. Which module are we practicing today: Listening, Reading, Writing, or Speaking?`
            };
        case 'NMC_CBT':
            return {
                systemInstruction: `You are an AI simulator for the UK's NMC Computer Based Test (CBT) for **${subMode || 'Adult'}** nurses. Your goal is to familiarize students with the format and content of the CBT exam. Ask the user if they're ready to start. Then, provide one question at a time, based on UK nursing standards and protocols. Questions should be multiple-choice. After the user answers, reveal the correct answer and provide a clear rationale based on NMC guidelines. The topic for this session is **${subMode || 'Adult'}** nursing.`,
                welcomeMessage: `Welcome to the NMC CBT Simulator for **${subMode || 'Adult'}** Nursing. Let's test your knowledge of UK standards. Are you ready for your first question?`
            };
        case 'Jobs':
            return {
                systemInstruction: `You are an AI Nursing Job Assistant. Your task is to help users find nursing jobs in Africa and abroad. Ask the user for their desired specialty, location (city/country), and years of experience. Use your search tool to find relevant job listings. Present the jobs in a clear, numbered list format, including the job title, hospital/clinic, location, and a brief summary. Crucially, after presenting the text, you MUST list all the source websites you used under a 'Sources:' heading. Do not invent jobs; use real-time search information.`,
                welcomeMessage: `Welcome to the Nursing Job Finder! Tell me what you're looking for. What specialty, city, and country are you interested in?`,
                tools: [{googleSearch: {}}]
            };
        case 'Career':
            return {
                systemInstruction: `You are an AI career and personal development coach for nurses in Africa. Your role is to provide guidance on topics like career progression, specialization, continuing education, leadership skills, resume building, and interview preparation. You should provide supportive, actionable advice. Start by asking the user what aspect of their career they'd like to discuss.`,
                welcomeMessage: `Hello! Let's talk about your nursing career. What's on your mind? We can discuss career paths, further studies, leadership, or anything else to help you grow professionally.`
            };
        case 'Tutor':
        default:
            return {
                systemInstruction: `You are an AI Tutor for African student nurses. Your goal is to explain nursing concepts clearly and concisely. You must not provide any prescriptive clinical instructions or medical advice. All your guidance should be educational and theoretical. Always encourage students to consult with their clinical instructors, supervisors, and preceptors for real-world patient care decisions. When you explain a medical concept, conclude your explanation with a section titled "**For Further Reading:**". Under this heading, suggest types of resources where students can find more information, such as specific nursing textbooks, reputable online medical databases (like WHO, Cochrane Library), or professional nursing journals. Frame your answers to be supportive, encouraging, and culturally relevant to the African context where appropriate.`,
                welcomeMessage: "Hello! I'm your AI Nursing Tutor. How can I help you with your studies today? Feel free to ask me about nursing concepts, patient care theory, or exam preparation."
            };
    }
};


const AITutor: React.FC = () => {
  const [mode, setMode] = useState<TutorMode>('Tutor');
  const [subMode, setSubMode] = useState<OSCESubMode | NMCCBTSubMode | null>(null);
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

  useEffect(() => {
    const initializeChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        setIsLoading(true);
        setError(null);
        setMessages([]);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { systemInstruction, welcomeMessage, tools } = getModeConfig(mode, subMode);

        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction,
              ...(tools && { tools }),
          }
        });
        
        setMessages([
            {
              id: 'init',
              text: welcomeMessage,
              sender: MessageSender.AI
            }
        ]);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "An unknown error occurred during initialization.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [mode, subMode]);
  
  const handleModeChange = (newMode: TutorMode) => {
    if (newMode !== mode) {
        setMode(newMode);
        setSubMode(null);
    }
  };

  const handleSubModeChange = (newSubMode: OSCESubMode | NMCCBTSubMode) => {
    setSubMode(newSubMode);
  };

  const generateAndPollVideo = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
            numberOfVideos: 1
        }
    });

    const maxPolls = 18; // 3 minutes max
    let pollCount = 0;

    while (!operation.done && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        pollCount++;
    }

    if (!operation.done) {
        throw new Error("Video generation timed out.");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
        return `${downloadLink}&key=${process.env.API_KEY}`;
    } else {
        throw new Error("Failed to get video download link from operation response.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.USER,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    // OSCE Video Generation Logic for the first user message
    if (mode === 'OSCE' && messages.length === 1) {
        const videoLoadingMessage: Message = {
            id: 'video-loading-' + Date.now(),
            text: '🎬 Generating an immersive video for your OSCE scenario... This can take a few minutes. Please wait.',
            sender: MessageSender.AI,
        };
        setMessages(prev => [...prev, videoLoadingMessage]);
        
        try {
            const videoPrompt = `A realistic, short, clinical simulation video for a nursing OSCE exam. The scenario is: "${currentInput}". Depict the patient and their immediate surroundings.`;
            const videoUrl = await generateAndPollVideo(videoPrompt);
            
            const response = await chatRef.current.sendMessage({ message: currentInput });
            let aiText = response.text;

            if (videoUrl) {
                aiText += `\n\n---\n**Visual Aid:**\n[Click here to watch a short video of the scenario](${videoUrl})`;
            }

            const aiMessage: Message = {
                id: Date.now().toString() + '-ai',
                text: aiText,
                sender: MessageSender.AI,
            };
            
            setMessages(prev => {
                const newMessages = prev.filter(m => m.id !== videoLoadingMessage.id);
                return [...newMessages, aiMessage];
            });

        } catch (videoError) {
            console.error("Video Generation Error:", videoError);
            setError("Sorry, I couldn't generate the video. Let's proceed with a text-only simulation.");
            
            // Fallback to text-only
            const response = await chatRef.current.sendMessage({ message: currentInput });
            const aiMessage: Message = {
                id: Date.now().toString() + '-ai-fallback',
                text: response.text,
                sender: MessageSender.AI,
            };

            setMessages(prev => {
                const newMessages = prev.filter(m => m.id !== videoLoadingMessage.id);
                return [...newMessages, aiMessage];
            });
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // Default message handling for other modes
    try {
      const response = await chatRef.current.sendMessage({ message: currentInput });
      let aiText = response.text;

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (mode === 'Jobs' && groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .map((chunk: any) => `- ${chunk.web.title || 'Source'}: ${chunk.web.uri}`)
            .join('\n');
        aiText += `\n\n---\n**Sources from Google Search:**\n${sources}`;
      }
      
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: aiText,
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
  
    const renderMessageText = (text: string) => {
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
        const parts = text.split(linkRegex);

        if (parts.length <= 1) {
            return text;
        }

        return parts.map((part, index) => {
            if (index % 3 === 1) { // Link text
                const url = parts[index + 1];
                return (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold">
                        {part}
                    </a>
                );
            }
            if (index % 3 === 2) { // URL
                return null;
            }
            return part; // Plain text
        }).filter(Boolean);
    };


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200">
      <ModeSelector 
        currentMode={mode} 
        currentSubMode={subMode}
        onModeChange={handleModeChange} 
        onSubModeChange={handleSubModeChange}
      />
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
                <div className="text-sm whitespace-pre-wrap">
                    {msg.sender === MessageSender.AI ? renderMessageText(msg.text) : msg.text}
                </div>
              </div>
              {msg.sender === MessageSender.USER && (
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                   <UserIcon className="w-5 h-5 text-gray-600" />
                 </div>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && !messages.some(m => m.id.startsWith('video-loading')) &&(
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
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;